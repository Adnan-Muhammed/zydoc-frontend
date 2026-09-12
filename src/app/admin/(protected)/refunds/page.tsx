'use client';

import React, { useEffect, useState } from 'react';
import appointmentService from '@/redux/features/appointment/appointmentService';

export default function AdminRefundRequestsPage() {
    const [disputedAppointments, setDisputedAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadDisputes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await appointmentService.getDisputedAppointmentsAdmin();
            setDisputedAppointments(data?.appointments || data || []);
        } catch (err: any) {
            console.error('Error fetching disputed appointments:', err);
            setError(err?.response?.data?.message || err.message || 'Failed to load disputed appointments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDisputes();
    }, []);

    const handleApproveRefund = async () => {
        if (!selectedDispute) return;
        setIsProcessing(true);
        try {
            const res = await appointmentService.refundDisputedAppointmentAdmin({
                appointmentId: selectedDispute._id,
                notes: adminNotes || 'Refund approved by Admin after dispute investigation.',
            });
            setToastMessage({
                type: 'success',
                text: res?.message || `Refund of ₹${selectedDispute.fee} successfully processed via Razorpay.`,
            });
            setSelectedDispute(null);
            setAdminNotes('');
            loadDisputes();
        } catch (err: any) {
            console.error('Error approving refund:', err);
            setToastMessage({
                type: 'error',
                text: err?.response?.data?.message || err.message || 'Failed to process refund.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const totalDisputedAmount = disputedAppointments.reduce((acc, app) => acc + (Number(app.fee) || 0), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-hand-holding-dollar text-indigo-600"></i>
                        Refund Requests & Disputes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review patient disputes for in-person consultations where the doctor was absent, and online doctor no-shows awaiting admin action. Approve manual Razorpay refunds.
                    </p>
                </div>
                <button
                    onClick={loadDisputes}
                    disabled={isLoading}
                    className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <i className={`fas fa-arrows-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
                    Refresh
                </button>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div
                    className={`p-4 rounded-xl flex items-center justify-between border shadow-sm ${
                        toastMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                        <i
                            className={`fas ${
                                toastMessage.type === 'success' ? 'fa-check-circle text-emerald-500' : 'fa-circle-xmark text-rose-500'
                            } text-base`}
                        ></i>
                        <span>{toastMessage.text}</span>
                    </div>
                    <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Disputes</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{disputedAppointments.length}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                        <i className="fas fa-triangle-exclamation"></i>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Disputed Value</div>
                        <div className="text-2xl font-black text-gray-900 mt-1">₹{totalDisputedAmount}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                        <i className="fas fa-indian-rupee-sign"></i>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto-Refund Gateway</div>
                        <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Razorpay Active
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <i className="fas fa-shield-check"></i>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
                    <i className="fas fa-spinner fa-spin text-3xl text-indigo-600 mb-3"></i>
                    <p className="font-medium">Loading refund requests...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl shadow-sm">
                    <p className="font-bold">Error loading disputes</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : disputedAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fas fa-check"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">All Clear! No Pending Disputes</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                        There are currently no disputed in-person appointments waiting for refund review.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">DOCTOR & CLINIC</th>
                                    <th className="px-6 py-4">PATIENT</th>
                                    <th className="px-6 py-4">APPOINTMENT</th>
                                    <th className="px-6 py-4">DISPUTE DETAILS</th>
                                    <th className="px-6 py-4">AMOUNT</th>
                                    <th className="px-6 py-4 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white text-sm">
                                {disputedAppointments.map((app) => {
                                    const doctor = app.doctorId || {};
                                    const patient = app.patientId || {};
                                    const patientProfile = patient.profileId || {};
                                    const patientName = `${patientProfile.firstName || ''} ${patientProfile.lastName || ''}`.trim() || patient.googleName || 'Patient';
                                    const clinicName = doctor.consultationSettings?.offline?.clinicName || doctor.consultationSettings?.physical?.clinicName || 'Clinic';
                                    const clinicAddress = doctor.consultationSettings?.offline?.clinicAddress || doctor.consultationSettings?.physical?.clinicAddress || '';

                                    return (
                                        <tr key={app._id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Doctor & Clinic */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                                                        {doctor.firstName ? doctor.firstName[0] : 'D'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            Dr. {doctor.firstName} {doctor.lastName}
                                                        </div>
                                                        <div className="text-xs text-indigo-600 font-medium">{clinicName}</div>
                                                        {clinicAddress && (
                                                            <div className="text-[11px] text-gray-400 max-w-[200px] truncate" title={clinicAddress}>
                                                                <i className="fas fa-location-dot mr-1"></i>
                                                                {clinicAddress}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Patient */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{patientName}</div>
                                                <div className="text-xs text-gray-500">{patient.email}</div>
                                                {patientProfile.phone && (
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        <i className="fas fa-phone text-[10px] mr-1"></i>
                                                        {patientProfile.phone}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Appointment Date & Time */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <i className="far fa-clock text-gray-400"></i>
                                                    {app.appointmentTime}
                                                </div>
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded mt-1 ${
                                                    app.status === 'refund_pending'
                                                        ? 'text-rose-700 bg-rose-50'
                                                        : 'text-emerald-700 bg-emerald-50'
                                                }`}>
                                                    <i className={`fas ${app.status === 'refund_pending' ? 'fa-video' : 'fa-building'} text-[10px]`}></i>
                                                    {app.status === 'refund_pending' ? 'Online (Doctor No-Show)' : 'In-Person'}
                                                </span>
                                            </td>

                                            {/* Dispute Details */}
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs space-y-2">
                                                    {/* Overlap Alert Banner */}
                                                    {app.hasOnlineOverlapAlert && (
                                                        <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg p-2.5">
                                                            <i className="fas fa-triangle-exclamation text-red-500 mt-0.5 shrink-0"></i>
                                                            <div>
                                                                <p className="text-xs font-bold text-red-700">⚠️ OVERLAP DETECTED</p>
                                                                <p className="text-[11px] text-red-600 mt-0.5">Doctor was in an online video call during this offline slot. This strongly suggests doctor fault.</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Dispute Reason */}
                                                    <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                                                        "{app.disputeReason || (app.status === 'refund_pending' ? 'Doctor did not join online consultation' : 'Doctor did not show up at clinic')}"
                                                    </div>

                                                    {/* Proof URL */}
                                                    {app.disputeProofUrl && (
                                                        <a
                                                            href={app.disputeProofUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <i className="fas fa-link text-[10px]"></i> View Patient Proof
                                                        </a>
                                                    )}

                                                    {app.disputedAt && (
                                                        <div className="text-[11px] text-gray-400">
                                                            Reported: {new Date(app.disputedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Amount & Split */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-base font-extrabold text-gray-900">₹{app.fee}</div>
                                                <div className="text-[11px] text-gray-500 space-y-0.5 mt-0.5">
                                                    <div>Doc: ₹{app.doctorAmount ?? (app.fee * 0.95).toFixed(0)}</div>
                                                    <div>Comm: ₹{app.adminCommission ?? (app.fee * 0.05).toFixed(0)}</div>
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDispute(app);
                                                        setAdminNotes(`Approved refund for in-person appointment ${app._id}. Patient reported doctor absence.`);
                                                    }}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                                                >
                                                    <i className="fas fa-check"></i>
                                                    Approve Refund
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approval Confirmation Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                                    <i className="fas fa-shield-check"></i>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Approve Dispute & Issue Refund</h3>
                            </div>
                            <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Refund Amount:</span>
                                    <span className="font-extrabold text-emerald-700 text-base">₹{selectedDispute.fee}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Patient:</span>
                                    <span className="font-medium text-gray-900">
                                        {selectedDispute.patientId?.profileId?.firstName || selectedDispute.patientId?.googleName || 'Patient'} ({selectedDispute.patientId?.email})
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Doctor:</span>
                                    <span className="font-medium text-gray-900">
                                        Dr. {selectedDispute.doctorId?.firstName} {selectedDispute.doctorId?.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Payment ID:</span>
                                    <span className="font-mono text-gray-700">{selectedDispute.paymentId || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Overlap Alert in Confirm Modal */}
                            {selectedDispute.hasOnlineOverlapAlert && (
                                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 flex items-start gap-3">
                                    <i className="fas fa-triangle-exclamation text-red-500 text-lg mt-0.5 shrink-0"></i>
                                    <div>
                                        <p className="text-sm font-bold text-red-700">⚠️ System Alert: Online Call Overlap Detected</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            Our system detected that this doctor was actively in an online video consultation during the exact time window of this missed offline appointment.
                                            This is strong evidence of doctor fault. Approving the refund is recommended.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2">
                                <i className="fas fa-exclamation-triangle text-amber-600 mt-0.5"></i>
                                <div>
                                    <p className="font-bold mb-0.5">Financial Actions Upon Approval:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        <li>100% (₹{selectedDispute.fee}) will be refunded via Razorpay to the patient's payment method.</li>
                                        <li>Doctor's payout (₹{selectedDispute.doctorAmount || (selectedDispute.fee * 0.95).toFixed(0)}) will be cancelled.</li>
                                        <li>Appointment status will change from <span className="font-mono font-bold">disputed</span> to <span className="font-mono font-bold text-teal-700">refunded</span>.</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Admin Resolution Notes (Optional)
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Enter resolution notes for internal records..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedDispute(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveRefund}
                                disabled={isProcessing}
                                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing && <i className="fas fa-spinner fa-spin"></i>}
                                {isProcessing ? 'Processing Refund...' : `Confirm & Refund ₹${selectedDispute.fee}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
