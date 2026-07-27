import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import AdminAddCustomer from './AdminAddCustomer';
import './AdminDashboard.css';

const API_BASE_URL = '';

export default function AdminCustomers() {
  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCustomers = useCallback(async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCustomers(res.data);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await fetchCustomers();
      } catch (e) {
        console.error('Failed to fetch customers', e);
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchCustomers]);

  const handleCustomerSuccess = (successMessage) => {
    setMessage(successMessage);
    fetchCustomers();
  };

  if (!token) return null;

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Customers</h1>
            <p className="subtitle">Manage your customer directory</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowAddModal(true)}>
            + Add Customer
          </button>
        </div>

        {message && <div className="success-banner">✓ {message}</div>}

        {/* Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="card-title">Customer List</span>
            <span className="card-badge">{customers.length} records</span>
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>No customers found</h3>
              <p>Add your first customer to get started.</p>
            </div>
          ) : (
            <div className="admin-card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Number</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading customers...</td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.customer_id}>
                        <td>{c.customer_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                        <td>{c.number}</td>
                        <td>{c.location}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AdminAddCustomer
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCustomerSuccess}
      />
    </div>
  );
}

