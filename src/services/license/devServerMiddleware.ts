import type { Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import path from 'path'

interface DevServerEnv {
  DODO_PAYMENTS_API_KEY?: string
  VITE_PAYMENT_MODE?: string
}

function resolveApiKey(envApiKey?: string): string | undefined {
  if (envApiKey && envApiKey.trim()) {
    return envApiKey.trim()
  }
  if (process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_API_KEY.trim()) {
    return process.env.DODO_PAYMENTS_API_KEY.trim()
  }
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf-8')
      const match = content.match(/^\s*DODO_PAYMENTS_API_KEY\s*=\s*(.*)$/m)
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '')
      }
    }
  } catch {}
  return undefined
}

export function createLicenseDevMiddleware(env: DevServerEnv): Connect.NextHandleFunction {
  return async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    if (req.url !== '/api/license/devices') {
      return next()
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }

    // Read body
    let bodyStr = ''
    req.on('data', (chunk) => {
      bodyStr += chunk
    })

    req.on('end', async () => {
      let licenseKey = ''
      try {
        const parsed = JSON.parse(bodyStr || '{}')
        licenseKey = (parsed.license_key || '').trim()
      } catch {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      }

      if (!licenseKey) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ error: 'License key is required' }))
      }

      const apiKey = resolveApiKey(env.DODO_PAYMENTS_API_KEY)
      if (!apiKey) {
        res.statusCode = 503
        res.setHeader('Content-Type', 'application/json')
        return res.end(
          JSON.stringify({
            valid: false,
            code: 'API_KEY_NOT_CONFIGURED',
            error: 'Dodo Payments API Key is not configured in local .env.local',
          })
        )
      }

      const isLive = env.VITE_PAYMENT_MODE === 'live'
      const baseUrl = isLive
        ? 'https://live.dodopayments.com'
        : 'https://test.dodopayments.com'

      try {
        // Validate key
        const validateRes = await fetch(`${baseUrl}/licenses/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ license_key: licenseKey }),
        })

        if (!validateRes.ok) {
          if (validateRes.status === 404) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ valid: false, code: 'NOT_FOUND', error: 'License key not found' }))
          }
          if (validateRes.status === 403) {
            res.statusCode = 403
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ valid: false, code: 'DISABLED', error: 'License key is inactive' }))
          }
        }

        // List keys
        let licenseKeyId: string | null = null
        let activationsLimit: number | null = null
        let instancesCount = 0

        const listKeysRes = await fetch(`${baseUrl}/license_keys?page_size=100`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (listKeysRes.ok) {
          const keysData = (await listKeysRes.json()) as {
            items?: Array<{
              id: string
              key: string
              activations_limit?: number | null
              instances_count?: number
            }>
          }

          const match = (keysData.items || []).find((k) => k.key === licenseKey)
          if (match) {
            licenseKeyId = match.id
            activationsLimit = match.activations_limit ?? null
            instancesCount = match.instances_count ?? 0
          }
        }

        // Fetch instances
        let instancesUrl = `${baseUrl}/license_key_instances?page_size=100`
        if (licenseKeyId) {
          instancesUrl += `&license_key_id=${encodeURIComponent(licenseKeyId)}`
        }

        const instancesRes = await fetch(instancesUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        let rawDevices: Array<{ id: string; name?: string; created_at: string; license_key_id?: string }> = []
        if (instancesRes.ok) {
          const instancesData = (await instancesRes.json()) as {
            items?: Array<{ id: string; name?: string; created_at: string; license_key_id?: string }>
          }
          rawDevices = instancesData.items || []
        }

        if (licenseKeyId) {
          rawDevices = rawDevices.filter((d) => !d.license_key_id || d.license_key_id === licenseKeyId)
        }

        const devices = rawDevices.map((d) => ({
          id: d.id,
          name: d.name || 'Device',
          createdAt: d.created_at,
        }))

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end(
          JSON.stringify({
            valid: true,
            activationsLimit,
            instancesCount: devices.length,
            devices,
          })
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Dev server error'
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ valid: false, error: message }))
      }
    })
  }
}

