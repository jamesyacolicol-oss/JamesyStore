import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, UserPlus } from 'lucide-react';

export default function AdminAddStaff({ open, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
    });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (open) {
            setFormData({ name: '', phone: '', password: '' });
            setErrorMsg('');
        }
    }, [open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            await axios.post('/api/admin/staff', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (typeof onSuccess === 'function') {
                onSuccess(`Staff "${formData.name}" added successfully!`);
            }
            onClose();
        } catch (error) {
            console.error(error);
            setErrorMsg(error.response?.data?.message || 'Error saving staff member');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" style={{ width: '480px', maxWidth: '90%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Register New Staff</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}><X size={24} /></button>
                </div>
                {errorMsg && (
                    <div style={{ margin: '12px 24px 0', padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px', borderLeft: '4px solid #ef4444' }}>{errorMsg}</div>
                )}
                <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Staff Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Juan Dela Cruz" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Phone Number (11 digits)</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="09123456789" maxLength={11} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Temporary Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Min. 6 characters" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Staff will be asked to set a permanent password on first login.</p>
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? (
                                <><Loader2 className="spin" size={18} /> Saving...</>
                            ) : (
                                <><UserPlus size={18} /> Save Staff</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

