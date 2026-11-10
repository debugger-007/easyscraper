import { paymentConfig } from '../../config/payment'

export interface ValidateLicenseResult {
  valid: boolean
  statusCode?: number
  error?: string
}

export interface DeactivateLicenseResult {
  success: boolean
  statusCode?: number
  error?: string
}

export interface DeviceInfo {
  id: string
  name: string
  createdAt: string
}

export interface FetchDevicesResult {
  valid: boolean
  activationsLimit?: number | null
  instancesCount?: number
  devices: DeviceInfo[]
  code?: string
  error?: string
}

/**
 * Calls the secure backend endpoint (/api/license/devices) to list devices associated with this license key.
 * If the server has no DODO_PAYMENTS_API_KEY configured, returns code 'API_KEY_NOT_CONFIGURED'.
 */
export async function fetchLicenseDevices(licenseKey: string): Promise<FetchDevicesResult> {
  const trimmedKey = licenseKey.trim()
  if (!trimmedKey) {
    return { valid: false, devices: [], error: 'Empty license key' }
  }

  try {
    const response = await fetch('/api/license/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license_key: trimmedKey }),
    })

    const data = (await response.json()) as FetchDevicesResult

    if (!response.ok) {
      return {
        valid: false,
        devices: [],
        code: data.code || `HTTP_${response.status}`,
        error: data.error || `HTTP ${response.status}`,
      }
    }

    return {
      valid: Boolean(data.valid),
      activationsLimit: data.activationsLimit,
      instancesCount: data.instancesCount,
      devices: Array.isArray(data.devices) ? data.devices : [],
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { valid: false, devices: [], error: message }
  }
}

/**
 * Returns the Dodo Payments API base host according to the active payment mode.
 */
export function getDodoBaseUrl(): string {
  // Respect live vs test environment
  return paymentConfig.isLive
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com'
}

/**
 * Validates a license key (and optionally checks a specific device instance ID).
 */
export async function validateLicense(
  licenseKey: string,
  instanceId?: string
): Promise<ValidateLicenseResult> {
  const trimmedKey = licenseKey.trim()
  if (!trimmedKey) {
    return { valid: false, error: 'Empty license key' }
  }

  const baseUrl = getDodoBaseUrl()
  const payload: Record<string, string> = {
    license_key: trimmedKey,
  }

  if (instanceId && instanceId.trim()) {
    payload.license_key_instance_id = instanceId.trim()
  }

  try {
    const response = await fetch(`${baseUrl}/licenses/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const data = (await response.json()) as { valid?: boolean }
      return { valid: Boolean(data.valid), statusCode: response.status }
    }

    if (response.status === 404) {
      return { valid: false, statusCode: 404, error: 'Not found' }
    }

    if (response.status === 403) {
      return { valid: false, statusCode: 403, error: 'Forbidden or inactive' }
    }

    return { valid: false, statusCode: response.status, error: `HTTP ${response.status}` }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { valid: false, error: message }
  }
}

/**
 * Deactivates a device instance from a license key, freeing the activation quota.
 */
export async function deactivateLicense(
  licenseKey: string,
  instanceId: string
): Promise<DeactivateLicenseResult> {
  const trimmedKey = licenseKey.trim()
  const trimmedInstanceId = instanceId.trim()

  if (!trimmedKey || !trimmedInstanceId) {
    return { success: false, error: 'Both license key and instance ID are required' }
  }

  const baseUrl = getDodoBaseUrl()

  try {
    const response = await fetch(`${baseUrl}/licenses/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: trimmedKey,
        license_key_instance_id: trimmedInstanceId,
      }),
    })

    if (response.ok) {
      return { success: true, statusCode: response.status }
    }

    if (response.status === 403) {
      return {
        success: false,
        statusCode: 403,
        error: 'Instance not found or does not belong to this license',
      }
    }

    if (response.status === 404) {
      return {
        success: false,
        statusCode: 404,
        error: 'License key not found',
      }
    }

    return {
      success: false,
      statusCode: response.status,
      error: `Deactivation failed with HTTP ${response.status}`,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: message }
  }
}

