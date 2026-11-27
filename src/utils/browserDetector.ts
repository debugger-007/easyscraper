import { useEffect, useState } from 'react'
import { CHROME_STORE_URL, EDGE_STORE_URL } from '../config/extension.ts'

export type TargetExtensionBrowser = 'edge' | 'chrome'

export interface BrowserDetectEnv {
  userAgent?: string
  brands?: Array<{ brand: string }>
}

/**
 * Detects whether the current runtime environment is Microsoft Edge.
 *
 * Evaluation sequence:
 * 1. Checks explicit `env.brands` or `navigator.userAgentData.brands` (User-Agent Client Hints).
 * 2. Checks User Agent string for Edge brand tokens (`Edg/`, `EdgA/`, `EdgiOS/`, `Edge/`).
 *
 * Returns `true` if Microsoft Edge is detected, `false` otherwise.
 */
export function isEdgeBrowser(env?: BrowserDetectEnv): boolean {
  // 1. User-Agent Client Hints brands check
  if (env?.brands) {
    return env.brands.some((b) => /Edge|Microsoft Edge/i.test(b.brand))
  }

  if (typeof navigator !== 'undefined' && 'userAgentData' in navigator) {
    const uaData = (navigator as unknown as { userAgentData?: { brands?: Array<{ brand: string }> } }).userAgentData
    if (Array.isArray(uaData?.brands) && uaData.brands.some((b) => /Edge|Microsoft Edge/i.test(b.brand))) {
      return true
    }
  }

  // 2. User Agent string regex check
  const ua = env?.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return false

  // Edg/ (modern desktop Chromium Edge), EdgA/ (Android), EdgiOS/ (iOS), Edge/ (legacy EdgeHTML)
  return /Edg(?:e|A|iOS)?\//i.test(ua)
}

/**
 * Returns 'edge' if the environment is Microsoft Edge, otherwise 'chrome' (all other browsers).
 */
export function getTargetBrowser(env?: BrowserDetectEnv): TargetExtensionBrowser {
  return isEdgeBrowser(env) ? 'edge' : 'chrome'
}

/**
 * React hook to reactively resolve the current browser and corresponding store download URL.
 * Defaults to 'chrome' on SSR / static pre-rendering, and dynamically detects in the browser client.
 */
export function useDetectedBrowser(): {
  isEdge: boolean
  browser: TargetExtensionBrowser
  storeUrl: string
} {
  const [isEdge, setIsEdge] = useState(() => isEdgeBrowser())

  useEffect(() => {
    setIsEdge(isEdgeBrowser())
  }, [])

  return {
    isEdge,
    browser: isEdge ? 'edge' : 'chrome',
    storeUrl: isEdge ? EDGE_STORE_URL : CHROME_STORE_URL,
  }
}
