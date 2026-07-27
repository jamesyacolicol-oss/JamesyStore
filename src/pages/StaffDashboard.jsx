import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_BASE_URL = '';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/staff/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching staff dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ flex: 1 }}>
        <main className="main-content">
          <div className="page-header"><h1>Dashboard</h1><p className="subtitle">Loading...</p></div>
        </main>
      </div>
    );
  }

  const totalOrders = dashboardData?.total_orders ?? 0;
  const recentOrders = dashboardData?.recent_orders ?? [];
  const lowStock = dashboardData?.low_stock ?? [];

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        <div className="page-header">
          <h1>Staff Dashboard</h1>
          <p className="subtitle">Store overview at a glance</p>
        </div>

        {/* Stats Summary */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="admin-card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb' }}>{totalOrders}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Orders</div>
          </div>
          <div className="admin-card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: lowStock.length > 0 ? '#dc2626' : '#059669' }}>{lowStock.length}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Low Stock Items</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card" style={{ marginBottom: '24px' }}>
          <div className="admin-card-header">
            <span className="card-title">Recent Orders</span>
            <span className="card-badge">{totalOrders} total</span>
          </div>
          <div className="admin-card-body">
            {recentOrders.length === 0 ? (
              <div className="empty-state"><p>No orders yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td style={{ fontWeight: 600 }}>{order.order_number || `ORD-${order.order_id}`}</td>
                      <td>{order.customer_name || 'Walk-in'}</td>
                      <td>{order.items_count}</td>
                      <td>₱{Number(order.total_amount || 0).toFixed(2)}</td>
                      <td><span className={`status-badge ${order.payment_status || 'pending'}`}>{order.payment_status || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="card-title" style={{ color: '#dc2626' }}>Low Stock Alerts</span>
              <span className="card-badge">{lowStock.length} items</span>
            </div>
            <div className="admin-card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.product_id}>
                      <td>{p.product_name}</td>
                      <td><span className="status-badge cancelled">{p.stock_quantity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

