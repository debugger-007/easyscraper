# License Management & Device Deactivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a brand-integrated License Management and Device Deactivation page (`/license` and `/$lang/license`) in the website to allow Pro users to check license status, view activations, and deactivate devices when changing computers or hitting activation limits.

**Architecture:** Client-side service interacts with Dodo Payments API with full i18n support. A dedicated `LicenseManagementPage` component provides a search and deactivation interface supporting both direct deactivation (Key + Instance ID) and querying/validating license status. Routes are integrated with TanStack Router (`/license` and `/$lang/license`) following the project's Path-Prefix i18n conventions.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS, Lucide React, TanStack Router, Dodo Payments REST API.

**Spec:** [docs/superpowers/plans/2026-11-10-license-management.md](file:///Users/mac/Desktop/learn/extension-website/docs/superpowers/plans/2026-11-10-license-management.md)

## Global Constraints

- Zero hardcoded UI strings: all user-facing text must be defined in `src/i18n/types.ts` (`TranslationSchema`) and aligned 100% in `src/i18n/locales/zh_CN.ts` and `src/i18n/locales/en.ts`.
- No binary language branching: components must retrieve copy via `t.license.*` from `useTranslate()`.
- Path-Prefix routing: English default at `/license`, Chinese localized at `/zh/license` (via `/$lang/license`).
- No unauthorized git commits or pushes: preserve working tree for user review.
- Verification gate: Every task deliverable must pass `npx tsc --noEmit` and `pnpm build` with 0 errors.

## Review Focus

1. **Empty / Whitespace License Key or Instance ID**: Validated before submission with immediate inline feedback; does not send unnecessary API requests.
2. **Invalid / Non-Existent Key (HTTP 404)**: Clean localized error display informing the user that the key could not be found.
3. **Instance Not Belonging to Key / Already Deactivated (HTTP 403)**: Localized warning indicating the device is either already deactivated or does not match this license.
4. **Network Timeout / Failure (Fetch Error)**: Graceful offline/timeout banner with retry button.
5. **URL Query Param Autofill**: If visited with `?key=...&instance_id=...`, fields are pre-filled automatically for seamless 1-click deactivation from the Chrome Extension.

---

### Task 1: Type Definitions and i18n Dictionaries for License Management

**Files:**
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/zh_CN.ts`

**Interfaces:**
- Produces: `TranslationSchema.license` namespace containing titles, placeholders, button labels, descriptions, and status/error messages for license validation and deactivation.

- [x] **Step 1: Declare `license` module in `src/i18n/types.ts`**

Add `license` to `TranslationSchema`:
```typescript
license: {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  subtitle: string;
  keyLabel: string;
  keyPlaceholder: string;
  instanceIdLabel: string;
  instanceIdPlaceholder: string;
  instanceIdHelp: string;
  checkBtn: string;
  deactivateBtn: string;
  deactivating: string;
  checking: string;
  statusValid: string;
  statusInvalid: string;
  statusExpired: string;
  statusDisabled: string;
  deactivateSuccessTitle: string;
  deactivateSuccessDesc: string;
  errorNotFound: string;
  errorForbidden: string;
  errorGeneric: string;
  backHome: string;
  faqTitle: string;
  faqHowToFindInstanceTitle: string;
  faqHowToFindInstanceDesc: string;
  faqLimitReachedTitle: string;
  faqLimitReachedDesc: string;
}
```

- [x] **Step 2: Add English translations to `src/i18n/locales/en.ts`**

Provide complete, natural English copy matching all declared keys in `license`.

- [x] **Step 3: Add Chinese translations to `src/i18n/locales/zh_CN.ts`**

Provide 100% matched simplified Chinese copy matching all declared keys in `license`.

- [x] **Step 4: Typecheck verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 2: Dodo Payments License Service Client

**Files:**
- Create: `src/services/license/licenseClient.ts`
- Test / Verify: TypeScript compile & exports

**Interfaces:**
- Produces:
  ```typescript
  export interface ValidateLicenseResult {
    valid: boolean;
    error?: string;
  }

  export interface DeactivateLicenseResult {
    success: boolean;
    error?: string;
    statusCode?: number;
  }

  export function getDodoBaseUrl(): string;
  export function validateLicense(licenseKey: string, instanceId?: string): Promise<ValidateLicenseResult>;
  export function deactivateLicense(licenseKey: string, instanceId: string): Promise<DeactivateLicenseResult>;
  ```

- [x] **Step 1: Implement `src/services/license/licenseClient.ts`**

Implement `validateLicense` and `deactivateLicense` using standard `fetch`:
- Resolves Dodo API endpoint based on `paymentConfig.isLive`: `https://live.dodopayments.com` vs `https://test.dodopayments.com`.
- Handles status codes: `200` (success), `403` (instance not found or does not belong to key), `404` (license key not found), `422` (validation error), network failures.

- [x] **Step 2: Typecheck verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 3: License Management UI Component

**Files:**
- Create: `src/components/license/LicenseManagementPage.tsx`

**Interfaces:**
- Consumes: `useTranslate` from `~/locales`, `validateLicense` & `deactivateLicense` from `~/services/license/licenseClient`.
- Produces: `export const LicenseManagementPage: React.FC<{ initialKey?: string; initialInstanceId?: string; currentLocale?: SupportedLocale }>`

- [x] **Step 1: Implement `LicenseManagementPage`**

Features:
- Glassmorphic card design matching `PaymentSuccessPage.tsx` and the dark theme.
- Input fields for `license_key` and `license_key_instance_id` with copy/paste ease.
- Auto-validation when `Check Status` is clicked.
- Device deactivation action with loading state, error toasts, and success card.
- Collapsible FAQ section answering "How to find your Instance ID" and "What to do if activation limit is reached".
- Quick return link to Home `/` or `/$lang`.

- [x] **Step 2: Typecheck verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 4: TanStack Router Integration (`/license` and `/$lang/license`)

**Files:**
- Create: `src/routes/license.tsx`
- Create: `src/routes/$lang/license.tsx`
- Modify: `src/components/Footer.tsx` (add link to License Management)

**Interfaces:**
- Consumes: `LicenseManagementPage`
- Produces: TanStack routes with URL query params support (`?key=...&instance_id=...`).

- [x] **Step 1: Create `src/routes/license.tsx`**

Implement `createFileRoute('/license')` with `validateSearch` for `key` and `instance_id`, canonical headers, and meta tags.

- [x] **Step 2: Create `src/routes/$lang/license.tsx`**

Implement `createFileRoute('/$lang/license')` with localized parameters.

- [x] **Step 3: Update `src/components/Footer.tsx`**

Add `t.nav.licenseManagement` (or footer equivalent) link so users can easily discover the device management page.

- [x] **Step 4: Verify route generation and build**

Run: `npx tsc --noEmit && pnpm build`
Expected: TanStack router generates route tree without errors; Vite build succeeds.

---

### Task 5: End-to-End Verification and UX Polish

**Files:**
- Verify all modified and new files.

- [x] **Step 1: Run complete typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [x] **Step 2: Run production build**

Run: `pnpm build`
Expected: Build output contains `dist/` with route `/license` and `/zh/license` bundled cleanly.

