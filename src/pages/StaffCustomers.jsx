import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get('/api/staff/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (e) {
      console.error('Failed to fetch customers', e);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Customers</h1>
            <p className="subtitle">View customer directory</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="card-title">Customer List</span>
            <span className="card-badge">{customers.length} records</span>
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading customers...</p></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>No customers found</h3>
              <p>No customers in the directory yet.</p>
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
                  {customers.map((c) => (
                    <tr key={c.customer_id}>
                      <td>{c.customer_id}</td>
                      <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                      <td>{c.number}</td>
                      <td>{c.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

