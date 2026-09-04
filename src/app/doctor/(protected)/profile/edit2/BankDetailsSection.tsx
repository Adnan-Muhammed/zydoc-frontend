'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateBankDetails } from '@/redux/features/doctor/doctorThunk';
import { resetBankDetailsSuccess, clearDoctorError } from '@/redux/features/doctor/doctorSlice';
import { BankDetails } from '@/types';
import { toast } from 'react-hot-toast';

export default function BankDetailsSection({ initialData }: { initialData: any }) {
    const dispatch = useAppDispatch();
    const { bankDetails, isUpdatingBankDetails, bankDetailsSuccess, error } = useAppSelector((state) => state.doctor);

    const extractBank = (data: any): BankDetails => ({
        accountNumber: data?.bankDetails?.accountNumber || data?.accountNumber || '',
        ifscCode: data?.bankDetails?.ifscCode || data?.ifscCode || '',
        bankName: data?.bankDetails?.bankName || data?.bankName || '',
        accountHolderName: data?.bankDetails?.accountHolderName || data?.accountHolderName || '',
    });

    const [bankForm, setBankForm] = useState<BankDetails>(extractBank(initialData));
    const [confirmAccountNumber, setConfirmAccountNumber] = useState(extractBank(initialData).accountNumber);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        const source = bankDetails || initialData;
        const extracted = extractBank(source);
        setBankForm(extracted);
        setConfirmAccountNumber(extracted.accountNumber);
    }, [initialData, bankDetails]);

    useEffect(() => {
        if (bankDetailsSuccess) {
            toast.success('Bank details saved successfully!');
            const timer = setTimeout(() => {
                dispatch(resetBankDetailsSuccess());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [bankDetailsSuccess, dispatch]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setValidationError(null);
        dispatch(clearDoctorError());

        if (!bankForm.accountHolderName.trim()) {
            setValidationError('Please enter the account holder name.');
            return;
        }

        if (!bankForm.accountNumber.trim()) {
            setValidationError('Please enter the bank account number.');
            return;
        }

        if (bankForm.accountNumber !== confirmAccountNumber) {
            setValidationError('Account numbers do not match. Please verify and re-enter.');
            return;
        }

        if (!bankForm.ifscCode.trim()) {
            setValidationError('Please enter a valid IFSC code.');
            return;
        }

        if (!bankForm.bankName.trim()) {
            setValidationError('Please enter the bank name.');
            return;
        }

        try {
            await dispatch(
                updateBankDetails({
                    accountNumber: bankForm.accountNumber.trim(),
                    ifscCode: bankForm.ifscCode.trim().toUpperCase(),
                    bankName: bankForm.bankName.trim(),
                    accountHolderName: bankForm.accountHolderName.trim(),
                })
            ).unwrap();
        } catch (err: any) {
            console.error('Failed to update bank details:', err);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-building-columns text-indigo-500 text-xs" /> Bank & Payout Details
                </h3>
                <button
                    type="button" 
                    onClick={() => handleSave()} 
                    disabled={isUpdatingBankDetails}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                    {isUpdatingBankDetails ? 'Saving...' : 'Save Section'}
                </button>
            </div>

            {/* Note */}
            <div className="bg-indigo-50/50 border border-indigo-100/70 p-3 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
                <i className="fas fa-shield-alt text-indigo-600 mt-0.5" />
                <span>
                    Your bank account information is encrypted and used exclusively by the administration to transfer payout settlements for completed consultations.
                </span>
            </div>

            {/* Success message */}
            {bankDetailsSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                    <i className="fas fa-check-circle text-emerald-600" />
                    <span>Bank & payout details updated successfully!</span>
                </div>
            )}

            {/* Validation / Backend Error */}
            {(validationError || error) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-rose-600" />
                    <span>{validationError || error}</span>
                </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Account Holder Name */}
                <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Account Holder Name
                    </label>
                    <input
                        type="text"
                        value={bankForm.accountHolderName}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                        placeholder="e.g. Dr. John Doe"
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <p className="text-[10px] text-slate-400">Must match the registered name on your bank account.</p>
                </div>

                {/* Bank Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Bank Name
                    </label>
                    <input
                        type="text"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                {/* IFSC Code */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        IFSC Code
                    </label>
                    <input
                        type="text"
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. HDFC0001234"
                        maxLength={11}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                {/* Account Number */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Account Number
                    </label>
                    <input
                        type="password"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        placeholder="Enter account number"
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                {/* Confirm Account Number */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Confirm Account Number
                    </label>
                    <input
                        type="text"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        placeholder="Re-enter account number"
                        className={`w-full text-sm px-3 py-2 border rounded-xl font-mono font-medium focus:outline-none focus:ring-2 transition-all ${
                            confirmAccountNumber && confirmAccountNumber !== bankForm.accountNumber
                                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                                : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
                        }`}
                    />
                    {confirmAccountNumber && confirmAccountNumber !== bankForm.accountNumber && (
                        <p className="text-[10px] text-rose-500">Account numbers do not match</p>
                    )}
                </div>
            </div>
        </div>
    );
}
