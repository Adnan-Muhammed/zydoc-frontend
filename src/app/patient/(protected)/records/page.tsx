'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Lab Results',
        notes: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/records`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch records');
            setRecords(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const form = new FormData();
        form.append('title', formData.title);
        form.append('category', formData.category);
        form.append('notes', formData.notes);
        form.append('file', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/records`, {
                method: 'POST',
                credentials: 'include',
                body: form
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to upload record');

            setSuccess('Record uploaded successfully');
            setShowModal(false);
            setFormData({ title: '', category: 'Lab Results', notes: '' });
            setFile(null);
            fetchRecords();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/records/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete record');

            fetchRecords();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const inputClasses = "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Medical Records</h1>
                    <Button onClick={() => setShowModal(true)} icon={<i className="fas fa-upload"></i>}>Upload Record</Button>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-start gap-3">
                        <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-start gap-3">
                        <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{success}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <i className="fas fa-folder-open text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Records Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">You haven't uploaded any medical records yet.</p>
                        <Button variant="secondary" onClick={() => setShowModal(true)}>Upload Your First Record</Button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Title</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Category</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Date Uploaded</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Notes</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    <i className="fas fa-file-medical text-blue-500"></i>
                                                    {record.title}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium">
                                                    {record.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                {record.notes || '-'}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <a href={`${process.env.NEXT_PUBLIC_API_URL}${record.fileUrl.startsWith('/') ? '' : '/'}${record.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View/Download">
                                                    <i className="fas fa-external-link-alt"></i>
                                                </a>
                                                <button onClick={() => handleDelete(record._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Upload Medical Record</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Record Title <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Complete Blood Count (CBC)" className={inputClasses} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category <span className="text-red-500">*</span></label>
                                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={`${inputClasses} appearance-none`}>
                                        <option value="Lab Results">Lab Results (Blood Test, etc.)</option>
                                        <option value="Imaging">Imaging (X-Ray, MRI, CT)</option>
                                        <option value="Prescription">Prescription</option>
                                        <option value="Discharge Summary">Discharge Summary</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional context..." rows={2} className={`${inputClasses} resize-none`}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">File Attachment <span className="text-red-500">*</span></label>
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => document.getElementById('record-file')?.click()}>
                                        <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 mb-2"></i>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file ? file.name : 'Click to select a file'}</p>
                                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                                        <input required id="record-file" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1" disabled={isUploading} icon={isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}>
                                        {isUploading ? 'Uploading...' : 'Upload Record'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
