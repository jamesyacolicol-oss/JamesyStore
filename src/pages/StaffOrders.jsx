import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminAddOrder from './AdminAddOrder';
import AdminOrderDetails from './AdminOrderDetails';
import './AdminDashboard.css';

const API_BASE_URL = '';

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [nextOrderNumber, setNextOrderNumber] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const formatMoney = useCallback((value) => {
    const n = Number(value || 0);
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(n);
  }, []);

  const authHeaders = useCallback(() => {
    const t = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${t}` };
  }, []);

  const fetchOrders = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/staff/orders`, {
      headers: authHeaders(),
    });
    setOrders(response.data || []);
  }, [authHeaders]);

  const fetchProducts = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/staff/products`, {
      headers: authHeaders(),
    });
    setProducts(response.data || []);
  }, [authHeaders]);

  const fetchNextOrderNumber = useCallback(async () => {
    const res = await axios.get(`${API_BASE_URL}/api/staff/orders/next-number`, {
      headers: authHeaders(),
    });
    setNextOrderNumber(res.data?.next_order_number ?? '');
  }, [authHeaders]);

  const refreshPageData = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setLoading(true);
      try {
        await Promise.all([fetchOrders(), fetchProducts(), fetchNextOrderNumber()]);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [fetchNextOrderNumber, fetchOrders, fetchProducts]
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const loadPageData = async () => {
      try {
        await refreshPageData({ showLoading: false });
      } catch (error) {
        console.error('Error loading staff orders page:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPageData();
    return () => { cancelled = true; };
  }, [refreshPageData, token]);

  const refreshOrdersAfterChange = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOrders(), fetchProducts(), fetchNextOrderNumber()]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = async (successMessage) => {
    setMessage(successMessage);
    await refreshOrdersAfterChange();
  };

  if (!token) return null;

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Orders</h1>
            <p className="subtitle">View and create store transactions</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setIsOrderModalOpen(true)}>
            + New Order
          </button>
        </div>

        {message && <div className="success-banner">✓ {message}</div>}

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="card-title">All Transactions</span>
            <span className="card-badge">{orders.length} saved</span>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <h3>No orders yet</h3>
              <p>Create a new order to start recording transactions.</p>
            </div>
          ) : (
            <div className="admin-card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Change</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }}
                            className="order-link"
                          >
                            {order.order_number || `ORD-${order.order_id}`}
                          </button>
                        </td>
                        <td>{order.customer_name || 'Walk-in'}</td>
                        <td>{order.ordered_at ? new Date(order.ordered_at).toLocaleString() : '-'}</td>
                        <td>{order.items?.length || 0}</td>
                        <td>{formatMoney(order.total_amount)}</td>
                        <td>{formatMoney(order.paid_amount ?? order.payment_amount)}</td>
                        <td>{formatMoney(order.change_amount)}</td>
                        <td><span className={`status-badge ${order.payment_status || 'pending'}`}>{order.payment_status || '-'}</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AdminAddOrder
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        products={products}
        generatedOrderNum={nextOrderNumber}
        onSuccess={handleOrderSuccess}
        formatMoney={formatMoney}
        baseUrl={API_BASE_URL}
        getToken={() => localStorage.getItem('token') || ''}
      />

      <AdminOrderDetails
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        formatMoney={formatMoney}
      />
    </div>
  );
}

