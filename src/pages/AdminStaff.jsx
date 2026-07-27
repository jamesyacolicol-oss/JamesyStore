import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import AdminAddStaff from './AdminAddStaff';
import './AdminDashboard.css';

const API_BASE_URL = '';

export default function AdminStaff() {
  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchStaff = useCallback(async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/staff`, {
      headers: authHeaders(),
    });
    setStaff(res.data);
  }, [authHeaders]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await fetchStaff();
      } catch (e) {
        console.error('Failed to fetch staff', e);
        if (!cancelled) setStaff([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchStaff]);

  const handleStaffSuccess = (successMessage) => {
    setMessage(successMessage);
    fetchStaff();
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Delete staff "${staffName}"? This action cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/staff/${staffId}`, {
        headers: authHeaders(),
      });
      setMessage(`Staff "${staffName}" deleted.`);
      fetchStaff();
    } catch (e) {
      console.error('Failed to delete staff', e);
      alert(e.response?.data?.message || 'Failed to delete staff');
    }
  };

  if (!token) return null;

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Staff</h1>
            <p className="subtitle">Manage your staff accounts</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowAddModal(true)}>
            + Add Staff
          </button>
        </div>

        {message && <div className="success-banner">✓ {message}</div>}

        {/* Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="card-title">Staff List</span>
            <span className="card-badge">{staff.length} members</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>No staff members yet</h3>
              <p>Add staff accounts to manage store access.</p>
            </div>
          ) : (
            <div className="admin-card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.staff_id}>
                      <td>{s.staff_id}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.phone}</td>
                      <td>
                        <span className={`status-badge ${s.is_active ? 'paid' : 'cancelled'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteStaff(s.staff_id, s.name)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AdminAddStaff
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleStaffSuccess}
      />
    </div>
  );
}

