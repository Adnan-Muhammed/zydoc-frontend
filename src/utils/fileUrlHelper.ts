/**
 * src/utils/fileUrlHelper.ts
 *
 * Architecture Note — Absolute URLs vs. Backend-Relative File Paths:
 *
 * 1. Absolute URLs:
 *    Assets intentionally public (e.g. approved doctor avatars on CloudFront CDN:
 *    https://d2j3r11t01prca.cloudfront.net/avatars/...) or external links (e.g. Google Drive dispute proof)
 *    are fully qualified HTTP(S) URLs. They must NOT be prepended with NEXT_PUBLIC_API_URL.
 *
 * 2. Backend-Relative Paths & S3 Object Keys:
 *    Private assets (patient medical records, consultation attachments, doctor verification docs,
 *    patient avatars, and dispute evidence) are stored in a private S3 bucket and MUST NOT be accessed
 *    directly. The frontend addresses them via the backend gatekeeper endpoints (e.g. /medical-records/:filename,
 *    /consultations/:filename, /patient-avatars/:filename, /uploads/:filename) which verify authorization cookies/headers
 *    and issue a 15-minute temporary presigned S3 redirect.
 *    These relative paths must be safely combined with NEXT_PUBLIC_API_URL.
 */

/**
 * Checks whether a given string is an absolute HTTP or HTTPS URL.
 *
 * @param url Candidate URL string.
 * @returns true if the URL begins with http:// or https://.
 */
export function isAbsoluteHttpUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\//i.test(url.trim());
}

/**
 * Resolves a stored file path, S3 object key, or absolute URL to a safe, complete URL.
 *
 * - Returns '' for null, undefined, empty, or whitespace-only inputs.
 * - Leaves absolute http:// and https:// URLs unchanged (trimmed).
 * - Rejects dangerous or unsupported URI schemes (e.g. javascript:, data:, blob:, file:, protocol-relative //).
 * - Prefixes relative paths and S3 object keys with the configured backend base URL (process.env.NEXT_PUBLIC_API_URL).
 * - Normalizes leading/trailing slashes to prevent malformed or duplicate slashes.
 * - If the backend base URL is empty or missing, returns a clean root-relative path (/path).
 *
 * @param filePathOrUrl Stored database URL, object key, or relative path.
 * @param customBaseUrl Optional override for the backend base URL (defaults to process.env.NEXT_PUBLIC_API_URL).
 * @returns Fully resolved URL string, or empty string if input is invalid/rejected.
 */
export function resolveFileUrl(
  filePathOrUrl: string | null | undefined,
  customBaseUrl?: string
): string {
  if (!filePathOrUrl || typeof filePathOrUrl !== 'string') {
    return '';
  }

  const trimmed = filePathOrUrl.trim();
  if (!trimmed) {
    return '';
  }

  // 1. Allow valid absolute HTTP(S) URLs as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 2. Reject protocol-relative URLs (e.g. "//evil.com" or "//domain.org/path")
  // Protocol-relative URLs start with exactly two slashes followed by a non-slash character.
  if (/^\/\/[^\/\s]/.test(trimmed)) {
    return '';
  }

  // 3. Reject any non-HTTP URI schemes (e.g. "javascript:", "data:", "blob:", "file:")
  // Any scheme has ASCII letters followed by letters/digits/+/-/. then a colon before any slash
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return '';
  }

  // 4. Normalize backslashes (Windows legacy paths) to forward slashes
  const normalized = trimmed.replace(/\\/g, '/');

  // 5. Ensure path starts with a single '/'
  const cleanPath = '/' + normalized.replace(/^\/+/, '');

  // 6. Resolve base URL (custom override or process.env.NEXT_PUBLIC_API_URL)
  const baseSource = customBaseUrl !== undefined ? customBaseUrl : process.env.NEXT_PUBLIC_API_URL;
  const cleanBase = (baseSource || '').trim().replace(/\/+$/, '');

  if (!cleanBase) {
    return cleanPath;
  }

  return `${cleanBase}${cleanPath}`;
}
