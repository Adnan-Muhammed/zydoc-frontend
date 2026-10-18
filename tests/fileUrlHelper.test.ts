// zydoc-frontend/tests/fileUrlHelper.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveFileUrl, isAbsoluteHttpUrl } from '../src/utils/fileUrlHelper';

describe('Phase F1: fileUrlHelper (resolveFileUrl & isAbsoluteHttpUrl)', () => {
  const BACKEND_URL = 'http://localhost:5000';

  describe('1. Null, undefined, empty, and whitespace-only values', () => {
    it('returns empty string for null', () => {
      assert.equal(resolveFileUrl(null, BACKEND_URL), '');
    });

    it('returns empty string for undefined', () => {
      assert.equal(resolveFileUrl(undefined, BACKEND_URL), '');
    });

    it('returns empty string for empty string', () => {
      assert.equal(resolveFileUrl('', BACKEND_URL), '');
    });

    it('returns empty string for whitespace-only strings', () => {
      assert.equal(resolveFileUrl('   ', BACKEND_URL), '');
      assert.equal(resolveFileUrl('\t\n\r', BACKEND_URL), '');
    });
  });

  describe('2. Valid absolute HTTP and HTTPS URLs', () => {
    it('preserves CloudFront HTTPS URLs unchanged without prepending backend base', () => {
      const cloudfrontUrl = 'https://d2j3r11t01prca.cloudfront.net/avatars/avatar-1729100000.webp';
      assert.equal(resolveFileUrl(cloudfrontUrl, BACKEND_URL), cloudfrontUrl);
      assert.equal(isAbsoluteHttpUrl(cloudfrontUrl), true);
    });

    it('preserves standard HTTP URLs unchanged', () => {
      const httpUrl = 'http://example.com/assets/logo.png';
      assert.equal(resolveFileUrl(httpUrl, BACKEND_URL), httpUrl);
      assert.equal(isAbsoluteHttpUrl(httpUrl), true);
    });

    it('trims surrounding whitespace from absolute URLs', () => {
      const cloudfrontUrl = '   https://d2j3r11t01prca.cloudfront.net/avatars/avatar-test.jpg   ';
      assert.equal(
        resolveFileUrl(cloudfrontUrl, BACKEND_URL),
        'https://d2j3r11t01prca.cloudfront.net/avatars/avatar-test.jpg'
      );
    });

    it('correctly handles external presigned S3 URLs', () => {
      const s3Url = 'https://zydoc-prod-private-files-482731.s3.ap-south-1.amazonaws.com/records/rec.pdf?X-Amz-Signature=123';
      assert.equal(resolveFileUrl(s3Url, BACKEND_URL), s3Url);
    });
  });

  describe('3. Relative paths beginning with /', () => {
    it('prefixes root-relative /uploads path with backend base URL', () => {
      assert.equal(
        resolveFileUrl('/uploads/avatar-12345.png', BACKEND_URL),
        'http://localhost:5000/uploads/avatar-12345.png'
      );
      assert.equal(isAbsoluteHttpUrl('/uploads/avatar-12345.png'), false);
    });

    it('prefixes root-relative /medical-records path with backend base URL', () => {
      assert.equal(
        resolveFileUrl('/medical-records/medrec-999.pdf', BACKEND_URL),
        'http://localhost:5000/medical-records/medrec-999.pdf'
      );
    });
  });

  describe('4. Relative paths without leading /', () => {
    it('prefixes relative uploads path without leading slash cleanly', () => {
      assert.equal(
        resolveFileUrl('uploads/avatar-12345.png', BACKEND_URL),
        'http://localhost:5000/uploads/avatar-12345.png'
      );
    });

    it('normalizes Windows backslashes in relative path', () => {
      assert.equal(
        resolveFileUrl('uploads\\avatar-12345.png', BACKEND_URL),
        'http://localhost:5000/uploads/avatar-12345.png'
      );
    });
  });

  describe('5. S3 object-key-style paths', () => {
    it('resolves medical-records object key to backend gatekeeper endpoint', () => {
      assert.equal(
        resolveFileUrl('medical-records/medrec-a1b2c3d4.pdf', BACKEND_URL),
        'http://localhost:5000/medical-records/medrec-a1b2c3d4.pdf'
      );
    });

    it('resolves patient-avatars object key to backend gatekeeper endpoint', () => {
      assert.equal(
        resolveFileUrl('patient-avatars/avatar-5678.webp', BACKEND_URL),
        'http://localhost:5000/patient-avatars/avatar-5678.webp'
      );
    });

    it('resolves consultations object key to backend gatekeeper endpoint', () => {
      assert.equal(
        resolveFileUrl('consultations/consult-file-123.pdf', BACKEND_URL),
        'http://localhost:5000/consultations/consult-file-123.pdf'
      );
    });

    it('resolves dispute-proofs object key to backend gatekeeper endpoint', () => {
      assert.equal(
        resolveFileUrl('dispute-proofs/dispute-proof-001.jpg', BACKEND_URL),
        'http://localhost:5000/dispute-proofs/dispute-proof-001.jpg'
      );
    });

    it('resolves medical-certificates object key to backend gatekeeper endpoint', () => {
      assert.equal(
        resolveFileUrl('medical-certificates/medcert-cert-77.pdf', BACKEND_URL),
        'http://localhost:5000/medical-certificates/medcert-cert-77.pdf'
      );
    });
  });

  describe('6. Missing or empty backend base URL', () => {
    it('returns clean root-relative path when base URL is explicitly empty string', () => {
      assert.equal(
        resolveFileUrl('medical-records/medrec-123.pdf', ''),
        '/medical-records/medrec-123.pdf'
      );
    });

    it('falls back to root-relative path when base URL is whitespace only', () => {
      assert.equal(
        resolveFileUrl('/uploads/file.png', '   '),
        '/uploads/file.png'
      );
    });

    it('falls back to environment variable or root-relative path when customBaseUrl is omitted', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      try {
        process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:5001';
        assert.equal(
          resolveFileUrl('consultations/file.pdf'),
          'http://127.0.0.1:5001/consultations/file.pdf'
        );

        delete process.env.NEXT_PUBLIC_API_URL;
        assert.equal(
          resolveFileUrl('consultations/file.pdf'),
          '/consultations/file.pdf'
        );
      } finally {
        process.env.NEXT_PUBLIC_API_URL = originalEnv;
      }
    });
  });

  describe('7. Unsupported URL schemes & security rejection', () => {
    it('rejects javascript: scheme and returns empty string', () => {
      assert.equal(resolveFileUrl('javascript:alert(1)', BACKEND_URL), '');
      assert.equal(resolveFileUrl('JAVASCRIPT:alert(1)', BACKEND_URL), '');
      assert.equal(isAbsoluteHttpUrl('javascript:alert(1)'), false);
    });

    it('rejects data: URI scheme and returns empty string', () => {
      assert.equal(resolveFileUrl('data:image/png;base64,iVBORw0KGgo...', BACKEND_URL), '');
      assert.equal(isAbsoluteHttpUrl('data:image/png;base64,aaa'), false);
    });

    it('rejects blob: URI scheme and returns empty string', () => {
      assert.equal(resolveFileUrl('blob:http://localhost:3000/uuid', BACKEND_URL), '');
    });

    it('rejects file: URI scheme and returns empty string', () => {
      assert.equal(resolveFileUrl('file:///etc/passwd', BACKEND_URL), '');
    });

    it('rejects protocol-relative URLs (//)', () => {
      assert.equal(resolveFileUrl('//malicious-site.com/avatar.png', BACKEND_URL), '');
    });
  });

  describe('8. URL concatenation & duplicate-slash handling', () => {
    it('avoids double slash when base URL has trailing slash', () => {
      assert.equal(
        resolveFileUrl('/uploads/file.png', 'http://localhost:5000/'),
        'http://localhost:5000/uploads/file.png'
      );
    });

    it('avoids double slash when base URL has multiple trailing slashes', () => {
      assert.equal(
        resolveFileUrl('uploads/file.png', 'http://localhost:5000///'),
        'http://localhost:5000/uploads/file.png'
      );
    });

    it('normalizes multiple leading slashes in path', () => {
      assert.equal(
        resolveFileUrl('///uploads/file.png', 'http://localhost:5000'),
        'http://localhost:5000/uploads/file.png'
      );
    });
  });
});
