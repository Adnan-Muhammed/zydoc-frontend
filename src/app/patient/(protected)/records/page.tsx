'use client';

// src/app/patient/(protected)/records/page.tsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  X,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  FileCheck,
  Download,
  Loader2
} from 'lucide-react';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

      setSuccess('Medical record uploaded successfully!');
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
    if (!confirm('Are you sure you want to delete this medical record?')) return;

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

  const categories = ['All', 'Lab Results', 'Imaging', 'Prescription', 'Discharge Summary', 'Other'];

  const filteredRecords = selectedCategory === 'All'
    ? records
    : records.filter((r) => r.category === selectedCategory);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Lab Results':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'Imaging':
        return { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' };
      case 'Prescription':
        return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
      case 'Discharge Summary':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="pat-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="pat-page-header">
        <div>
          <h1>Medical Records</h1>
          <p>Securely store, organize, and manage all your clinical documents, lab reports, and imaging.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="pat-btn pat-btn-primary pat-btn-lg"
          style={{ cursor: 'pointer' }}
        >
          <Upload size={16} />
          <span>Upload Record</span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="pat-info-box error" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {success && (
        <div className="pat-info-box success" style={{ marginBottom: 20 }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{success}</span>
          <button
            onClick={() => setSuccess('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className="pat-stats-grid" style={{ marginBottom: 24 }}>
        <div className="pat-stat-card indigo">
          <div className="pat-stat-icon-wrap">
            <FileText size={20} />
          </div>
          <div className="pat-stat-value">{records.length}</div>
          <div className="pat-stat-label">Total Documents</div>
        </div>

        <div className="pat-stat-card sky">
          <div className="pat-stat-icon-wrap">
            <FileCheck size={20} />
          </div>
          <div className="pat-stat-value">
            {records.filter(r => r.category === 'Lab Results').length}
          </div>
          <div className="pat-stat-label">Lab Reports</div>
        </div>

        <div className="pat-stat-card emerald">
          <div className="pat-stat-icon-wrap">
            <Calendar size={20} />
          </div>
          <div className="pat-stat-value">
            {records.filter(r => r.category === 'Prescription').length}
          </div>
          <div className="pat-stat-label">Prescriptions</div>
        </div>

        <div className="pat-stat-card amber">
          <div className="pat-stat-icon-wrap">
            <FolderOpen size={20} />
          </div>
          <div className="pat-stat-value">
            {records.filter(r => r.category === 'Imaging').length}
          </div>
          <div className="pat-stat-label">Imaging & Scans</div>
        </div>
      </div>

      {/* ── Category Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--pat-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={13} /> Filter:
        </span>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 600,
                border: isActive ? '1px solid var(--pat-primary)' : '1px solid var(--pat-border)',
                background: isActive ? 'var(--pat-primary)' : 'var(--pat-surface)',
                color: isActive ? '#fff' : 'var(--pat-text-soft)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Records Content ── */}
      {loading ? (
        <div className="pat-card" style={{ padding: 48, textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--pat-primary)' }} />
          <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.9rem' }}>Loading medical records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="pat-card pat-empty">
          <div className="pat-empty-icon">
            <FolderOpen size={30} />
          </div>
          <h3>No Records Found</h3>
          <p>You haven&apos;t uploaded any medical records yet. Upload reports to share them with your doctors during consultations.</p>
          <button
            onClick={() => setShowModal(true)}
            className="pat-btn pat-btn-primary"
            style={{ marginTop: 12 }}
          >
            <Plus size={16} />
            <span>Upload Your First Record</span>
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="pat-card pat-empty">
          <div className="pat-empty-icon">
            <Filter size={28} />
          </div>
          <h3>No Records in &quot;{selectedCategory}&quot;</h3>
          <p>No documents match this category filter.</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="pat-btn pat-btn-outline"
            style={{ marginTop: 10 }}
          >
            View All Records
          </button>
        </div>
      ) : (
        <div className="pat-card">
          <div className="pat-card-header">
            <h2>
              <FileText size={18} style={{ color: 'var(--pat-primary)' }} />
              <span>Documents ({filteredRecords.length})</span>
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="pat-table-wrap" style={{ display: 'block' }}>
            <table className="pat-table">
              <thead>
                <tr>
                  <th>Record Title</th>
                  <th>Category</th>
                  <th>Date Uploaded</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const color = getCategoryColor(record.category);
                  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${record.fileUrl?.startsWith('/') ? '' : '/'}${record.fileUrl}`;
                  return (
                    <tr key={record._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: '#ede9fe',
                              color: 'var(--pat-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={18} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--pat-text)', display: 'block' }}>
                              {record.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {record.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--pat-text-soft)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(record.date || record.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ color: 'var(--pat-text-soft)', fontSize: '0.82rem', maxWidth: 220 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {record.notes || '—'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="pat-btn pat-btn-outline pat-btn-sm"
                            title="View / Download"
                          >
                            <ExternalLink size={13} />
                            <span>View</span>
                          </a>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="pat-btn pat-btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: 480,
              overflow: 'hidden',
              border: '1px solid var(--pat-border)',
              animation: 'patFadeUp 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--pat-border)',
                background: 'linear-gradient(to bottom, #fafbff, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pat-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={18} style={{ color: 'var(--pat-primary)' }} />
                <span>Upload Medical Record</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--pat-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                  borderRadius: 8
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpload} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pat-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Record Title <span style={{ color: 'var(--pat-rose)' }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Complete Blood Count (CBC) Report"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pat-border)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: 'var(--pat-text)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pat-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Category <span style={{ color: 'var(--pat-rose)' }}>*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pat-border)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: 'var(--pat-text)',
                    background: '#fff',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Lab Results">Lab Results (Blood Test, Urine, etc.)</option>
                  <option value="Imaging">Imaging (X-Ray, MRI, CT, Ultrasound)</option>
                  <option value="Prescription">Prescription Document</option>
                  <option value="Discharge Summary">Discharge Summary / Hospital Record</option>
                  <option value="Other">Other Medical Document</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pat-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Clinical Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any details or observations..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pat-border)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: 'var(--pat-text)',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pat-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  File Attachment <span style={{ color: 'var(--pat-rose)' }}>*</span>
                </label>
                <div
                  onClick={() => document.getElementById('record-file-input')?.click()}
                  style={{
                    border: '2px dashed var(--pat-border)',
                    borderRadius: 14,
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: file ? '#f0fdf4' : '#fafbff',
                    borderColor: file ? '#86efac' : 'var(--pat-border)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Upload size={24} style={{ color: file ? '#10b981' : 'var(--pat-muted)', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '0.84rem', fontWeight: 700, color: file ? '#166534' : 'var(--pat-text)', margin: '0 0 4px' }}>
                    {file ? file.name : 'Click to select a document'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--pat-muted)', margin: 0 }}>
                    PDF, JPG, PNG up to 10MB
                  </p>
                  <input
                    id="record-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="pat-btn pat-btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="pat-btn pat-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', opacity: isUploading ? 0.7 : 1 }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
