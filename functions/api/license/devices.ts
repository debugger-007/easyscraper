/// <reference types="@cloudflare/workers-types" />

interface Env {
  DODO_PAYMENTS_API_KEY?: string
  VITE_PAYMENT_MODE?: string
  DODO_PAYMENTS_ENVIRONMENT?: string
}

export interface DeviceInfo {
  id: string
  name: string
  createdAt: string
}

export interface DevicesResponse {
  valid: boolean
  activationsLimit?: number | null
  instancesCount?: number
  devices: DeviceInfo[]
  error?: string
  code?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // 1. Check API Key
  const apiKey = env.DODO_PAYMENTS_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        valid: false,
        code: 'API_KEY_NOT_CONFIGURED',
        error: 'Dodo Payments API Key is not configured on this server.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Parse request body
  let licenseKey = ''
  try {
    const body = (await request.json()) as { license_key?: string }
    licenseKey = (body.license_key || '').trim()
  } catch {
    return new Response(
      JSON.stringify({ valid: false, error: 'Invalid JSON request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!licenseKey) {
    return new Response(
      JSON.stringify({ valid: false, error: 'License key is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. Resolve API host
  const isLive =
    env.VITE_PAYMENT_MODE === 'live' ||
    env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  const baseUrl = isLive
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com'

  try {
    // 4. Validate license key existence
    const validateRes = await fetch(`${baseUrl}/licenses/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey }),
    })

    if (!validateRes.ok) {
      if (validateRes.status === 404) {
        return new Response(
          JSON.stringify({ valid: false, code: 'NOT_FOUND', error: 'License key not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (validateRes.status === 403) {
        return new Response(
          JSON.stringify({ valid: false, code: 'DISABLED', error: 'License key is inactive or disabled' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // 5. Look up the license key object by listing license keys
    let licenseKeyId: string | null = null
    let activationsLimit: number | null = null
    let instancesCount: number = 0

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

    // 6. Fetch instances for this license key
    let instancesUrl = `${baseUrl}/license_key_instances?page_size=100`
    if (licenseKeyId) {
      instancesUrl += `&license_key_id=${encodeURIComponent(licenseKeyId)}`
    }

    const instancesRes = await fetch(instancesUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!instancesRes.ok) {
      return new Response(
        JSON.stringify({
          valid: true,
          devices: [],
          activationsLimit,
          instancesCount,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const instancesData = (await instancesRes.json()) as {
      items?: Array<{
        id: string
        name?: string
        created_at: string
        license_key_id?: string
      }>
    }

    let rawDevices = instancesData.items || []
    if (licenseKeyId) {
      rawDevices = rawDevices.filter((d) => !d.license_key_id || d.license_key_id === licenseKeyId)
    }

    const devices: DeviceInfo[] = rawDevices.map((d) => ({
      id: d.id,
      name: d.name || 'Device',
      createdAt: d.created_at,
    }))

    const result: DevicesResponse = {
      valid: true,
      activationsLimit,
      instancesCount: devices.length,
      devices,
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error'
    return new Response(
      JSON.stringify({ valid: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

