// zydoc-frontend/tests/f03-payment-modal-dismissal.test.ts
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ──────────────────────────────────────────────────────────────────────────────
// Suite: F-03 Frontend Razorpay Modal Dismissal & Payment Processing State
// ──────────────────────────────────────────────────────────────────────────────
describe('F-03: Razorpay Modal Dismissal & Payment Processing Flow', () => {
    let dispatchedActions: any[];
    let mockDispatch: (action: any) => any;
    let heartbeatCleared: boolean;
    let mockClearHeartbeat: () => void;

    beforeEach(() => {
        dispatchedActions = [];
        heartbeatCleared = false;
        mockDispatch = (action: any) => {
            dispatchedActions.push(action);
            return {
                unwrap: () => Promise.resolve(action)
            };
        };
        mockClearHeartbeat = () => {
            heartbeatCleared = true;
        };
    });

    /**
     * Factory that constructs the Razorpay options object exactly as defined
     * in BookingForm.tsx (lines 349-403) to test its operational semantics.
     */
    function createBookingPaymentFlow({
        verifyPaymentPromise = Promise.resolve({ success: true }),
        onVerifySuccess = () => {},
        onVerifyError = (_err: any) => {},
        initialProcessing = false,
        initialCompleted = false,
    } = {}) {
        const paymentCompleted = { current: initialCompleted };
        const paymentProcessing = { current: initialProcessing };
        const state = {
            isPaymentLoading: false,
            modalError: null as string | null,
            showConfirmModal: true,
            slotsAvailable: false,
        };

        const doctor = { _id: 'doc_123', id: 'doc_123', firstName: 'Jane', lastName: 'Doe' };
        const appointmentId = 'app_98765';
        const dateString = '2026-10-15';
        const time = '10:00 AM';
        const type = 'online';

        const options = {
            key: 'rzp_test_key',
            amount: 50000,
            currency: 'INR',
            order_id: 'order_rzp_12345',
            handler: async function (response: any) {
                // Finding F-03: Prevent duplicate callback executions
                if (paymentProcessing.current || paymentCompleted.current) {
                    return;
                }
                paymentProcessing.current = true;
                mockClearHeartbeat();
                try {
                    state.isPaymentLoading = true;
                    const action = {
                        type: 'appointment/verifyPayment',
                        payload: {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId
                        }
                    };
                    dispatchedActions.push(action);
                    await verifyPaymentPromise;
                    paymentCompleted.current = true;
                    paymentProcessing.current = false;
                    state.showConfirmModal = false;
                    onVerifySuccess();
                } catch (err: any) {
                    paymentProcessing.current = false;
                    if (err?.code === 'SLOT_EXPIRED_REFUNDED') {
                        state.modalError = 'Your slot lock expired and was booked by another patient. Any amount charged has been refunded.';
                    } else {
                        state.modalError = err?.message || err || 'Payment verification failed.';
                    }
                    onVerifyError(err);
                } finally {
                    state.isPaymentLoading = false;
                }
            },
            modal: {
                ondismiss: function () {
                    mockClearHeartbeat();
                    // Finding F-03: Prevent Razorpay modal dismissal from unlocking
                    // the slot when payment processing or verification is in progress,
                    // or after payment has already completed.
                    if (paymentProcessing.current || paymentCompleted.current) {
                        return;
                    }

                    const unlockAction = {
                        type: 'appointment/unlockSlot',
                        payload: {
                            doctorId: doctor._id || doctor.id,
                            date: dateString,
                            time,
                            consultationType: type
                        }
                    };
                    dispatchedActions.push(unlockAction);

                    state.slotsAvailable = true;
                    state.isPaymentLoading = false;
                    state.showConfirmModal = false;
                }
            }
        };

        const handleCancelBeforePayment = () => {
            if (!paymentProcessing.current && !paymentCompleted.current) {
                dispatchedActions.push({
                    type: 'appointment/unlockSlot',
                    payload: {
                        doctorId: doctor._id || doctor.id,
                        date: dateString,
                        time,
                        consultationType: type
                    }
                });
                state.slotsAvailable = true;
            }
            state.showConfirmModal = false;
            state.modalError = null;
        };

        return {
            options,
            paymentCompleted,
            paymentProcessing,
            state,
            handleCancelBeforePayment
        };
    }

    it('1. Dismissing the modal before payment starts releases the lock as intended', () => {
        const flow = createBookingPaymentFlow();

        assert.equal(flow.paymentProcessing.current, false, 'Payment must not be processing yet');
        assert.equal(flow.paymentCompleted.current, false, 'Payment must not be completed yet');

        // User clicks Razorpay modal "X" without entering payment credentials
        flow.options.modal.ondismiss();

        assert.equal(heartbeatCleared, true, 'Heartbeat timer must be cleared upon dismissal');
        assert.equal(flow.state.slotsAvailable, true, 'Slot availability must be reset');
        assert.equal(flow.state.showConfirmModal, false, 'Confirm modal must close');

        const unlockAction = dispatchedActions.find(a => a.type === 'appointment/unlockSlot');
        assert.ok(unlockAction, 'unlockSlot action MUST be dispatched when dismissed before payment starts');
        assert.deepEqual(unlockAction.payload, {
            doctorId: 'doc_123',
            date: '2026-10-15',
            time: '10:00 AM',
            consultationType: 'online'
        });
    });

    it('2. Dismissing the modal during payment processing does NOT unlock the slot', async () => {
        let resolveVerification: (val?: any) => void;
        const pendingVerification = new Promise<{ success: boolean }>(resolve => {
            resolveVerification = resolve;
        }); 

        const flow = createBookingPaymentFlow({
            verifyPaymentPromise: pendingVerification
        });

        // 1. Razorpay invokes payment handler when user submits payment
        const paymentPromise = flow.options.handler({
            razorpay_order_id: 'order_rzp_12345',
            razorpay_payment_id: 'pay_rzp_99999',
            razorpay_signature: 'sig_valid_abc'
        });

        // Verify state is immediately transitioned to processing
        assert.equal(flow.paymentProcessing.current, true, 'paymentProcessing must immediately be true');
        assert.equal(flow.state.isPaymentLoading, true, 'isPaymentLoading must be true');

        // 2. Razorpay checkout closes modal while verifyPayment request is in flight!
        flow.options.modal.ondismiss();

        // 3. Verify that unlockSlot was NOT dispatched!
        const unlockAction = dispatchedActions.find(a => a.type === 'appointment/unlockSlot');
        assert.equal(unlockAction, undefined, 'CRITICAL: ondismiss must NOT dispatch unlockSlot while payment is processing!');
        assert.equal(flow.state.slotsAvailable, false, 'Slot must NOT be marked available');

        // 4. Complete verification
        resolveVerification!({ success: true });
        await paymentPromise;

        assert.equal(flow.paymentCompleted.current, true, 'Payment must complete');
        assert.equal(flow.paymentProcessing.current, false, 'Payment processing must reset upon completion');
        assert.equal(flow.state.isPaymentLoading, false, 'Loading indicator must clear');
    });

    it('3. A successful payment callback does NOT trigger an unlock even if ondismiss fires afterwards', async () => {
        let verifyCallCount = 0;
        const flow = createBookingPaymentFlow({
            verifyPaymentPromise: Promise.resolve().then(() => {
                verifyCallCount++;
                return { success: true };
            })
        });

        // 1. Handler completes payment successfully
        await flow.options.handler({
            razorpay_order_id: 'order_rzp_12345',
            razorpay_payment_id: 'pay_rzp_99999',
            razorpay_signature: 'sig_valid_abc'
        });

        assert.equal(flow.paymentCompleted.current, true, 'paymentCompleted must be true');
        assert.equal(verifyCallCount, 1, 'verifyPayment should be called exactly once');

        // 2. Razorpay SDK fires modal.ondismiss after handler resolves
        flow.options.modal.ondismiss();

        // Must NOT unlock
        const unlockAction = dispatchedActions.find(a => a.type === 'appointment/unlockSlot');
        assert.equal(unlockAction, undefined, 'unlockSlot must NOT be dispatched after successful payment');

        // 3. Duplicate handler execution attempt (e.g., duplicate SDK event)
        await flow.options.handler({
            razorpay_order_id: 'order_rzp_12345',
            razorpay_payment_id: 'pay_rzp_99999',
            razorpay_signature: 'sig_valid_abc'
        });
        assert.equal(verifyCallCount, 1, 'Duplicate handler callback must be ignored and not re-dispatch verification');
    });

    it('4. A failed or cancelled payment follows the existing safe recovery behavior', async () => {
        const errorObject = {
            code: 'SLOT_EXPIRED_REFUNDED',
            message: 'Slot expired'
        };

        const flow = createBookingPaymentFlow({
            verifyPaymentPromise: Promise.reject(errorObject)
        });

        // 1. Payment handler triggers and verification rejects
        await flow.options.handler({
            razorpay_order_id: 'order_rzp_12345',
            razorpay_payment_id: 'pay_rzp_99999',
            razorpay_signature: 'sig_valid_abc'
        });

        // 2. Verify paymentProcessing is reset on failure
        assert.equal(flow.paymentProcessing.current, false, 'paymentProcessing must be reset to false on failure');
        assert.equal(flow.paymentCompleted.current, false, 'paymentCompleted must remain false');
        assert.equal(flow.state.isPaymentLoading, false, 'isPaymentLoading must be false');
        assert.equal(
            flow.state.modalError,
            'Your slot lock expired and was booked by another patient. Any amount charged has been refunded.',
            'Appropriate user-facing error message must be set'
        );

        // 3. User cancels the dialog after failure: safe recovery releases lock
        flow.handleCancelBeforePayment();

        const unlockAction = dispatchedActions.find(a => a.type === 'appointment/unlockSlot');
        assert.ok(unlockAction, 'User cancellation after failed payment safely releases the lock');
        assert.equal(flow.state.showConfirmModal, false, 'Confirm modal is closed');
    });
});
