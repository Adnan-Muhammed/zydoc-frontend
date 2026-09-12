'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllAdminAppointments } from '@/redux/features/appointment/appointmentThunk';
import { getAppointmentStatusConfig } from '@/utils/appointmentStatus';
import appointmentService from '@/redux/features/appointment/appointmentService';

export default function AdminAppointmentsPage() {
    const dispatch = useAppDispatch();
    const { adminAppointments, isLoading, error } = useAppSelector((state) => state.appointment);
    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [isRefunding, setIsRefunding] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchAllAdminAppointments());
    }, [dispatch]);

    const handleRefundAppointment = async (aptId: string) => {
        if (!confirm('Are you sure you want to approve and process this refund via Razorpay? The doctor payout will also be cancelled.')) return;
        setIsRefunding(true);
        try {
            const res = await appointmentService.refundDisputedAppointmentAdmin({
                appointmentId: aptId,
                notes: 'Manual refund processed by admin from master appointments list.'
            });
            alert(res?.message || 'Refund successfully processed via Razorpay.');
            setSelectedApt(null);
            dispatch(fetchAllAdminAppointments());
        } catch (err: any) {
            console.error('Error processing refund:', err);
            alert(err?.response?.data?.message || err.message || 'Failed to process refund.');
        } finally {
            setIsRefunding(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Master Appointments List</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
                    {error}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        DOCTOR
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        PATIENT
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        DATE & TIME
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        TYPE
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        STATUS
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {adminAppointments && adminAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <i className="fas fa-calendar-times text-4xl mb-3 text-gray-300"></i>
                                            <p>No appointments found in the system.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    adminAppointments?.map((apt: any) => (
                                        <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img 
                                                            className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                                            src={apt.doctorId?.avatarUrl ? `${process.env.NEXT_PUBLIC_API_URL}${apt.doctorId.avatarUrl}` : '/default-avatar.png'} 
                                                            alt="" 
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {apt.doctorId?.specialty}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {apt.isManualBooking ? (
                                                            <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xs">
                                                                OP
                                                            </div>
                                                        ) : (
                                                            <img 
                                                                className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                                                src={(apt.patientId?.profileId?.avatarUrl || apt.patientId?.googleAvatarUrl) 
                                                                    ? apt.patientId?.googleAvatarUrl?.startsWith('http')
                                                                        ? apt.patientId.googleAvatarUrl
                                                                        : `${process.env.NEXT_PUBLIC_API_URL}${apt.patientId?.profileId?.avatarUrl || apt.patientId?.googleAvatarUrl}` 
                                                                    : '/default-avatar.png'} 
                                                                alt="" 
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                                            {apt.isManualBooking ? (
                                                                <>
                                                                    <span>{apt.manualPatientDetails?.name || 'Direct Patient'}</span>
                                                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                                                                        Direct
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span>
                                                                    {apt.patientId?.profileId?.firstName || apt.patientId?.googleName} {apt.patientId?.profileId?.lastName || ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {apt.isManualBooking ? (
                                                                <span>
                                                                    {apt.manualPatientDetails?.opNumber ? `OP: ${apt.manualPatientDetails.opNumber}` : (apt.manualPatientDetails?.phone || 'Walk-In')}
                                                                </span>
                                                            ) : (
                                                                apt.patientId?.email
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                                    <i className="far fa-clock mr-1"></i> {apt.appointmentTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col items-start">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        apt.isManualBooking
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                            : (apt.consultationType === 'online' || apt.consultationType === 'video') 
                                                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        <i className={`fas ${apt.isManualBooking ? 'fa-hospital-user' : (apt.consultationType === 'online' || apt.consultationType === 'video') ? 'fa-video' : 'fa-user-doctor'} mr-1.5 mt-0.5`}></i>
                                                        {apt.isManualBooking ? 'Direct Booking' : (apt.consultationType === 'online' || apt.consultationType === 'video') ? 'Online' : 'In-Person'}
                                                    </span>
                                                    {apt.isManualBooking ? (
                                                        <span className="mt-1 text-[10px] text-amber-700 font-medium">0% Commission</span>
                                                    ) : (apt.consultationType === 'offline' || apt.consultationType === 'physical') && (apt.doctorId?.consultationSettings?.offline?.clinicName || apt.doctorId?.consultationSettings?.physical?.clinicName) && (
                                                        <div className="mt-1.5 text-xs text-gray-500 max-w-[150px] truncate" title={`${apt.doctorId?.consultationSettings?.offline?.clinicName || apt.doctorId?.consultationSettings?.physical?.clinicName} - ${apt.doctorId?.consultationSettings?.offline?.clinicAddress || apt.doctorId?.consultationSettings?.physical?.clinicAddress}`}>
                                                            <i className="fas fa-location-dot mr-1 text-gray-400"></i>
                                                            {apt.doctorId?.consultationSettings?.offline?.clinicName || apt.doctorId?.consultationSettings?.physical?.clinicName}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const statusConfig = getAppointmentStatusConfig(apt.status, 'admin');
                                                    return (
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig.badgeClass}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => setSelectedApt(apt)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors border border-indigo-100"
                                                >
                                                    <i className="fas fa-eye mr-1.5"></i>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedApt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                Booking Details
                                <span className="ml-3 text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md">
                                    ID: {selectedApt._id.substring(0, 8).toUpperCase()}
                                </span>
                            </h2>
                            <button 
                                onClick={() => setSelectedApt(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Doctor Contact Info */}
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                    <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">Doctor Contact</h3>
                                    <div className="flex items-center">
                                        <div className="ml-1">
                                            <div className="text-sm font-semibold text-gray-900">Dr. {selectedApt.doctorId?.firstName} {selectedApt.doctorId?.lastName}</div>
                                            <div className="text-xs text-gray-600 mt-1.5"><i className="fas fa-phone mr-1.5 text-indigo-400 w-3"></i> {selectedApt.doctorId?.phone || 'N/A'}</div>
                                            <div className="text-xs text-gray-600 mt-1"><i className="fas fa-envelope mr-1.5 text-indigo-400 w-3"></i> {selectedApt.doctorId?.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Contact Info */}
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                    <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                                        <span>Patient Contact</span>
                                        {selectedApt.isManualBooking && (
                                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                                                Direct Booking
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex items-center">
                                        <div className="ml-1">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {selectedApt.isManualBooking 
                                                    ? (selectedApt.manualPatientDetails?.name || 'Walk-In Patient')
                                                    : `${selectedApt.patientId?.profileId?.firstName || selectedApt.patientId?.googleName || ''} ${selectedApt.patientId?.profileId?.lastName || ''}`}
                                            </div>
                                            {selectedApt.isManualBooking ? (
                                                <>
                                                    {selectedApt.manualPatientDetails?.opNumber && (
                                                        <div className="text-xs text-gray-700 font-medium mt-1">
                                                            <i className="fas fa-id-card mr-1.5 text-amber-600 w-3"></i> OP No: {selectedApt.manualPatientDetails.opNumber}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        <i className="fas fa-phone mr-1.5 text-blue-400 w-3"></i> {selectedApt.manualPatientDetails?.phone || 'No phone recorded'}
                                                    </div>
                                                    {selectedApt.manualPatientDetails?.notes && (
                                                        <div className="text-xs text-gray-500 italic mt-1">
                                                            <i className="fas fa-sticky-note mr-1.5 text-gray-400 w-3"></i> {selectedApt.manualPatientDetails.notes}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-xs text-gray-600 mt-1.5"><i className="fas fa-phone mr-1.5 text-blue-400 w-3"></i> {selectedApt.patientId?.profileId?.phone || 'N/A'}</div>
                                                    <div className="text-xs text-gray-600 mt-1"><i className="fas fa-envelope mr-1.5 text-blue-400 w-3"></i> {selectedApt.patientId?.email || 'N/A'}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial & Appointment Info */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Administrative & Financial</h3>
                                    {(() => {
                                        const modalStatus = getAppointmentStatusConfig(selectedApt.status, 'admin');
                                        return (
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${modalStatus.badgeClass}`}>
                                                {modalStatus.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Schedule</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {new Date(selectedApt.appointmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at {selectedApt.appointmentTime}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Consultation Mode</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            <i className={`fas ${selectedApt.isManualBooking ? 'fa-user-check text-amber-600' : (selectedApt.consultationType === 'online' || selectedApt.consultationType === 'video') ? 'fa-video text-purple-500' : 'fa-user-doctor text-blue-500'} mr-2`}></i>
                                            {selectedApt.isManualBooking ? 'Direct Booking' : (selectedApt.consultationType === 'online' || selectedApt.consultationType === 'video') ? 'Online Video' : 'In-Person Clinic'}
                                        </p>
                                    </div>
                                    
                                    <div className="col-span-1 sm:col-span-2 border-t border-gray-100"></div>

                                    {selectedApt.isManualBooking ? (
                                        <div className="col-span-1 sm:col-span-2 bg-amber-50/60 rounded-lg p-3 border border-amber-200">
                                            <p className="text-xs font-semibold text-amber-900 flex items-center justify-between">
                                                <span><i className="fas fa-info-circle mr-1"></i> Direct Booking Payment</span>
                                                <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">Not Tracked</span>
                                            </p>
                                            <div className="text-xs text-gray-600 mt-2">
                                                Fees and payments for direct bookings are handled directly by the doctor and are not tracked by the platform.
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5">Total Amount Collected</p>
                                                <p className="text-2xl font-bold text-gray-900 flex items-center">
                                                    ₹{selectedApt.fee || 0}
                                                    <span className={`ml-3 px-2 py-0.5 align-middle inline-flex text-xs font-medium rounded capitalize border ${
                                                        selectedApt.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                        selectedApt.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {selectedApt.paymentStatus || 'pending'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="bg-green-50/60 rounded-lg p-3 border border-green-200">
                                                <p className="text-xs font-semibold text-green-900 mb-2 border-b border-green-200 pb-1.5">Revenue Split Setup</p>
                                                <div className="text-sm">
                                                    <div className="flex justify-between text-gray-600 mb-1.5">
                                                        <span>Admin Commission:</span>
                                                        <span className="text-green-700 font-bold">₹{selectedApt.adminCommission || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between text-gray-600 font-medium">
                                                        <span>Doctor Payment:</span>
                                                        <span className="text-gray-900">₹{selectedApt.doctorAmount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            {selectedApt.isManualBooking ? (
                                <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                    <i className="fas fa-money-bill-wave text-amber-600"></i> Direct Payment (Cash/UPI) — Outside Platform
                                </span>
                            ) : (selectedApt.status === 'refunded' || selectedApt.paymentStatus === 'refunded') ? (
                                <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
                                    <i className="fas fa-check-circle text-teal-500"></i> Refunded via Razorpay
                                </span>
                            ) : (
                                <button 
                                    className="px-4 py-2 bg-white border border-red-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-1.5 disabled:opacity-50"
                                    onClick={() => handleRefundAppointment(selectedApt._id)}
                                    disabled={isRefunding}
                                >
                                    <i className={`fas ${isRefunding ? 'fa-spinner fa-spin' : 'fa-undo'}`}></i>
                                    {isRefunding ? 'Processing Refund...' : 'Approve & Issue Refund'}
                                </button>
                            )}
                            <button 
                                onClick={() => setSelectedApt(null)}
                                className="px-5 py-2 bg-gray-800 rounded-md text-sm font-medium text-white hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
