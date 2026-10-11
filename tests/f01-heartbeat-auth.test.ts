// zydoc-frontend/tests/f01-heartbeat-auth.test.ts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Production Code Imports ──────────────────────────────────────────────────
import { extendLock } from '../src/lib/appointments';
import axiosInstance, { injectStore } from '../src/api/axiosInstance';

// ── Test Helpers ─────────────────────────────────────────────────────────────

describe('F-01: Slot-Lock Heartbeat Authentication & Error Handling (Production extendLock)', () => {
    let origPost: any;

    beforeEach(() => {
        origPost = axiosInstance.post;
    });

    afterEach(() => {
        axiosInstance.post = origPost;
    });

    it('1. Verifies axiosInstance configuration uses withCredentials for httpOnly cookie transport', () => {
        assert.equal(
            axiosInstance.defaults.withCredentials,
            true,
            'axiosInstance must have withCredentials: true so httpOnly auth cookies are automatically sent'
        );
        assert.ok(
            axiosInstance.defaults.baseURL?.endsWith('/api'),
            'axiosInstance must point to /api base URL'
        );
    });

    it('2. Attaches Authorization header if Redux contains accessToken (dual auth mechanism)', async () => {
        // Mock Redux store
        const mockStore: any = {
            getState: () => ({
                auth: {
                    accessToken: 'header_bearer_jwt_token_12345'
                }
            }),
            dispatch: () => {}
        };
        injectStore(mockStore);

        let capturedConfig: any = null;
        // Trigger interceptor by creating request config
        const interceptor = (axiosInstance.interceptors.request as any).handlers[0];
        if (interceptor && interceptor.fulfilled) {
            capturedConfig = interceptor.fulfilled({ headers: {} });
        }

        assert.ok(capturedConfig, 'Request interceptor should execute');
        assert.equal(
            capturedConfig.headers['Authorization'],
            'Bearer header_bearer_jwt_token_12345',
            'Must attach Bearer header when token exists in Redux store'
        );
    });

    it('3. Successfully extends slot lock via axiosInstance and returns lock details', async () => {
        const slotId = 'slot_sample_67890';
        let calledUrl = '';
        let calledPayload: any = null;

        axiosInstance.post = (async (url: string, payload: any) => {
            calledUrl = url;
            calledPayload = payload;
            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Slot lock extended successfully',
                    lockExpiryTime: '2026-10-15T10:10:00.000Z'
                }
            };
        }) as any;

        const result = await extendLock(slotId);

        assert.equal(calledUrl, '/appointments/extend-lock');
        assert.deepEqual(calledPayload, { slotId });
        assert.equal(result.success, true);
        assert.equal(result.lockExpiryTime, '2026-10-15T10:10:00.000Z');
    });

    it('4. Handles 401 Unauthorized without falsely reporting that slot is still locked', async () => {
        const slotId = 'slot_unauth_12345';

        axiosInstance.post = (async () => {
            const err: any = new Error('Request failed with status code 401');
            err.response = {
                status: 401,
                data: { success: false, message: 'Unauthorized. No token provided or session expired.' }
            };
            throw err;
        }) as any;

        await assert.rejects(
            async () => await extendLock(slotId),
            (err: any) => {
                assert.match(err.message, /Unauthorized/);
                assert.equal(err.response?.status, 401);
                return true;
            },
            'Must throw error on 401 and not falsely report success'
        );
    });

    it('5. Handles 400 Bad Request (expired/invalid slot) without falsely reporting locked', async () => {
        const slotId = 'slot_expired_54321';

        axiosInstance.post = (async () => {
            const err: any = new Error('Request failed with status code 400');
            err.response = {
                status: 400,
                data: { success: false, message: 'Slot lock expired and was released' }
            };
            throw err;
        }) as any;

        await assert.rejects(
            async () => await extendLock(slotId),
            (err: any) => {
                assert.match(err.message, /Slot lock expired/);
                assert.equal(err.response?.status, 400);
                return true;
            },
            'Must throw error on 400 when lock expired'
        );
    });
});
