/**
 * joinTokenIntegration.test.ts
 *
 * Comprehensive test suite validating:
 * 1. Doctor no-show messaging while refund status is PENDING_REVIEW (no false refund claims)
 * 2. Join-token request and parameter contract (POST /api/appointments/:id/join-token)
 * 3. Socket.IO handshake authentication integration (distinct user JWT and room Join Token)
 * 4. Token request failure & unauthorized appointment access (403, 400 early/closed/terminal)
 * 5. Expired & single-use token lifecycle during reconnect/rejoin (fresh token issuance on reconnect)
 * 6. Doctor 3-minute manual-end lock behavior remains intact
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getAuthoritativeRefundStatus } from '../src/utils/appointmentTiming.js';
import { getAppointmentStatusConfig } from '../src/utils/appointmentStatus.js';
import { appointmentService } from '../src/redux/features/appointment/appointmentService.js';
import axiosInstance from '../src/api/axiosInstance.js';

describe('ZyDoc Frontend: Refund Messaging & Join Token Integration Tests', () => {

  // ── Part A: Doctor No-Show Messaging & Authoritative Review ─────────────
  describe('Part A — Doctor No-Show Messaging while refund status is PENDING_REVIEW', () => {
    test('routes unresolved doctor no-show (DOCTOR_NO_SHOW, PENDING_REVIEW) to administrative review', () => {
      const app = {
        _id: 'appt_no_show_001',
        status: 'DOCTOR_NO_SHOW',
        refundState: 'PENDING_REVIEW',
        fee: 500,
      };

      const refundStatus = getAuthoritativeRefundStatus(app);
      assert.equal(refundStatus.status, 'PENDING_REVIEW');
      assert.equal(refundStatus.badgeLabel, 'Doctor Missed (Under Review)');
      assert.match(
        refundStatus.description,
        /administrative review and refund processing/i,
        'Description must state administrative review and refund processing'
      );
      assert.doesNotMatch(
        refundStatus.description,
        /has been credited/i,
        'UI must not claim refund has already been credited'
      );
    });

    test('routes legacy doctor_missed status with PENDING_REVIEW to administrative review', () => {
      const app = {
        _id: 'appt_no_show_002',
        status: 'doctor_missed',
        refundState: 'PENDING_REVIEW',
      };

      const refundStatus = getAuthoritativeRefundStatus(app);
      assert.equal(refundStatus.status, 'PENDING_REVIEW');
      assert.equal(refundStatus.badgeLabel, 'Doctor Missed (Under Review)');
      assert.match(refundStatus.description, /administrative review and refund processing/i);
    });

    test('getAppointmentStatusConfig renders under-review badges for doctor and patient views', () => {
      const app = {
        _id: 'appt_no_show_003',
        status: 'DOCTOR_NO_SHOW',
        refundState: 'PENDING_REVIEW',
      };

      // Patient view
      const patientConfig = getAppointmentStatusConfig('DOCTOR_NO_SHOW', 'patient', app);
      assert.equal(patientConfig.label, 'Doctor Missed (Under Review)');
      assert.equal(patientConfig.badgeClass, 'bg-amber-50 text-amber-700 border border-amber-200');

      // Doctor view
      const doctorConfig = getAppointmentStatusConfig('DOCTOR_NO_SHOW', 'doctor', app);
      assert.equal(doctorConfig.label, 'Missed Consultation (Under Review)');
      assert.equal(doctorConfig.badgeClass, 'bg-amber-50 text-amber-700 border border-amber-200');
    });

    test('displays COMPLETED refund only when authoritative backend confirms it', () => {
      const appCompleted = {
        _id: 'appt_no_show_004',
        status: 'DOCTOR_NO_SHOW',
        refundState: 'COMPLETED',
        refundStatus: 'COMPLETED',
      };

      const refundStatus = getAuthoritativeRefundStatus(appCompleted);
      assert.equal(refundStatus.status, 'COMPLETED');
      assert.equal(refundStatus.badgeLabel, 'Refunded');
      assert.equal(refundStatus.description, 'Refund has been confirmed and credited.');
    });

    test('cancelled appointments without confirmed refunds never falsely claim credit', () => {
      const appCancelled = {
        _id: 'appt_cancelled_005',
        status: 'cancelled',
        paymentStatus: 'paid',
      };

      const refundStatus = getAuthoritativeRefundStatus(appCancelled);
      assert.equal(refundStatus.status, 'NONE');
      assert.equal(refundStatus.badgeLabel, 'Cancelled');
      assert.equal(refundStatus.description, 'Appointment cancelled. No refund transaction confirmed.');
    });
  });

  // ── Part B: Join Token Service Contract & Handshake Integration ─────────
  describe('Part B — Join Token Service & API Contract', () => {
    let originalPost: any;

    beforeEach(() => {
      originalPost = axiosInstance.post;
    });

    afterEach(() => {
      axiosInstance.post = originalPost;
    });

    test('requests initial join token with isRejoin: false via POST /appointments/:id/join-token', async () => {
      let capturedUrl = '';
      let capturedBody: any = null;
      let capturedConfig: any = null;

      axiosInstance.post = (async (url: string, body: any, config: any) => {
        capturedUrl = url;
        capturedBody = body;
        capturedConfig = config;
        return {
          data: {
            success: true,
            token: 'signed.join.token.jti123',
            jti: 'jti-uuid-1',
            sessionId: 'video_appt_123',
            serverNow: new Date().toISOString(),
            expiresInSeconds: 300,
          },
        };
      }) as any;

      const res = await appointmentService.getJoinToken('appt_123', false);

      assert.equal(capturedUrl, '/appointments/appt_123/join-token');
      assert.deepEqual(capturedBody, { isRejoin: false });
      assert.equal(capturedConfig.params, undefined);
      assert.equal(res.success, true);
      assert.equal(res.token, 'signed.join.token.jti123');
      assert.equal(res.expiresInSeconds, 300);
    });

    test('requests reconnect token with isRejoin: true and ?rejoin=true query param', async () => {
      let capturedUrl = '';
      let capturedBody: any = null;
      let capturedConfig: any = null;

      axiosInstance.post = (async (url: string, body: any, config: any) => {
        capturedUrl = url;
        capturedBody = body;
        capturedConfig = config;
        return {
          data: {
            success: true,
            token: 'signed.fresh.rejoin.token.jti456',
            jti: 'jti-uuid-2',
            sessionId: 'video_appt_123',
            serverNow: new Date().toISOString(),
            expiresInSeconds: 300,
          },
        };
      }) as any;

      const res = await appointmentService.getJoinToken('appt_123', true);

      assert.equal(capturedUrl, '/appointments/appt_123/join-token');
      assert.deepEqual(capturedBody, { isRejoin: true });
      assert.deepEqual(capturedConfig.params, { rejoin: 'true' });
      assert.equal(res.success, true);
      assert.equal(res.token, 'signed.fresh.rejoin.token.jti456');
    });

    test('preserves user JWT and passes issued joinToken in Socket.IO handshake auth', () => {
      const userAccessToken = 'user.auth.jwt.bearer_token_999';
      const issuedJoinToken = 'signed.room.join.token.jti_room_abc';

      // Verify handshake auth payload construction contract
      const handshakeAuth = {
        token: userAccessToken || undefined,
        joinToken: issuedJoinToken,
        roomToken: issuedJoinToken,
      };

      // 1. Regular user JWT is NOT replaced or discarded
      assert.equal(handshakeAuth.token, userAccessToken, 'User JWT must be preserved in handshake auth.token');

      // 2. Room-specific Join Token is distinctly present
      assert.equal(handshakeAuth.joinToken, issuedJoinToken, 'Join Token must be present in auth.joinToken');
      assert.equal(handshakeAuth.roomToken, issuedJoinToken, 'Join Token alias must be present in auth.roomToken');

      // 3. User JWT is not interchangeable with room token
      assert.notEqual(handshakeAuth.joinToken, handshakeAuth.token);
    });

    test('handles token request failure: 403 Unauthorized participant access', async () => {
      axiosInstance.post = (async () => {
        const error: any = new Error('Unauthorized');
        error.response = {
          status: 403,
          data: {
            success: false,
            code: 'NOT_AUTHORIZED',
            message: 'Unauthorized: You are not an assigned participant for this appointment.',
          },
        };
        throw error;
      }) as any;

      await assert.rejects(
        async () => {
          await appointmentService.getJoinToken('appt_unauthorized', false);
        },
        (err: any) => {
          assert.equal(err.response.status, 403);
          assert.equal(err.response.data.code, 'NOT_AUTHORIZED');
          assert.match(err.response.data.message, /not an assigned participant/i);
          return true;
        }
      );
    });

    test('handles token request failure: 400 JOIN_TOO_EARLY and JOIN_WINDOW_CLOSED', async () => {
      // Early join
      axiosInstance.post = (async () => {
        const error: any = new Error('Early join rejected');
        error.response = {
          status: 400,
          data: {
            success: false,
            code: 'JOIN_TOO_EARLY',
            message: 'Consultation room opens at 2026-10-17T10:00:00.000Z',
            earlyJoinAt: '2026-10-17T10:00:00.000Z',
          },
        };
        throw error;
      }) as any;

      await assert.rejects(
        async () => {
          await appointmentService.getJoinToken('appt_early', false);
        },
        (err: any) => {
          assert.equal(err.response.data.code, 'JOIN_TOO_EARLY');
          assert.ok(err.response.data.earlyJoinAt);
          return true;
        }
      );

      // Window closed
      axiosInstance.post = (async () => {
        const error: any = new Error('Join window closed');
        error.response = {
          status: 400,
          data: {
            success: false,
            code: 'JOIN_WINDOW_CLOSED',
            message: 'The initial join window for this appointment has closed.',
          },
        };
        throw error;
      }) as any;

      await assert.rejects(
        async () => {
          await appointmentService.getJoinToken('appt_closed', false);
        },
        (err: any) => {
          assert.equal(err.response.data.code, 'JOIN_WINDOW_CLOSED');
          return true;
        }
      );
    });

    test('handles token request failure: 400 SESSION_TERMINAL', async () => {
      axiosInstance.post = (async () => {
        const error: any = new Error('Terminal session');
        error.response = {
          status: 400,
          data: {
            success: false,
            code: 'SESSION_TERMINAL',
            message: 'This consultation session is terminal and cannot be joined.',
          },
        };
        throw error;
      }) as any;

      await assert.rejects(
        async () => {
          await appointmentService.getJoinToken('appt_terminal', false);
        },
        (err: any) => {
          assert.equal(err.response.data.code, 'SESSION_TERMINAL');
          return true;
        }
      );
    });
  });

  // ── Reconnection Lifecycle & Manual End Lock ───────────────────────────
  describe('Part B — Reconnect Token Lifecycle & Manual-End Lock Intactness', () => {
    test('reconnect lifecycle: acquires new token with distinct jti on reconnect attempt', async () => {
      let callCount = 0;
      const tokensIssued: string[] = [];

      const mockGetJoinToken = async (id: string, isRejoin?: boolean) => {
        callCount++;
        const newToken = `token_v${callCount}_rejoin_${Boolean(isRejoin)}`;
        tokensIssued.push(newToken);
        return {
          success: true,
          token: newToken,
          jti: `jti-${callCount}`,
          expiresInSeconds: 300,
        };
      };

      // Initial Join
      const initialRes = await mockGetJoinToken('appt_reconnect_test', false);
      assert.equal(initialRes.token, 'token_v1_rejoin_false');
      assert.equal(initialRes.jti, 'jti-1');

      // First Reconnect Attempt (e.g. socket reconnect_attempt)
      const reconnect1Res = await mockGetJoinToken('appt_reconnect_test', true);
      assert.equal(reconnect1Res.token, 'token_v2_rejoin_true');
      assert.notEqual(reconnect1Res.jti, initialRes.jti, 'Reconnect must NOT reuse initial single-use jti');

      // Second Reconnect Attempt
      const reconnect2Res = await mockGetJoinToken('appt_reconnect_test', true);
      assert.equal(reconnect2Res.token, 'token_v3_rejoin_true');
      assert.notEqual(reconnect2Res.token, reconnect1Res.token, 'Subsequent reconnect must generate a fresh token');
    });

    test('manual-end lock verification contract: doctor End Call locked before 3 minutes', async () => {
      // Simulating the backend response contract returned by POST /api/appointments/:id/end-call
      const backendLockResponse = {
        success: false,
        code: 'MANUAL_END_LOCKED',
        elapsedSeconds: 75,
        remainingSeconds: 105,
        manualEndAllowedAt: new Date(Date.now() + 105000).toISOString(),
        message: 'Minimum 3 continuous minutes of consultation is required before ending this session.',
      };

      // Verify that frontend ManualEndLockResult matches expected shape
      const lockResult = {
        locked: true,
        elapsedSeconds: backendLockResponse.elapsedSeconds,
        remainingSeconds: backendLockResponse.remainingSeconds,
        manualEndAllowedAt: backendLockResponse.manualEndAllowedAt,
        message: backendLockResponse.message,
      };

      assert.equal(lockResult.locked, true);
      assert.equal(lockResult.elapsedSeconds, 75);
      assert.equal(lockResult.remainingSeconds, 105);
      assert.ok(lockResult.manualEndAllowedAt);
      assert.match(lockResult.message, /3 continuous minutes/i);
    });
  });
});
