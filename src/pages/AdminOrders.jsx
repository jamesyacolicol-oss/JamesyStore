import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminAddOrder from './AdminAddOrder';
import './AdminDashboard.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [nextOrderNumber, setNextOrderNumber] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const formatMoney = (value) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(Number(value || 0));

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }), []);

  const fetchOrders = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
      headers: authHeaders(),
    });
    setOrders(response.data);
  }, [authHeaders]);

  const fetchProducts = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
      headers: authHeaders(),
    });
    setProducts(response.data);
  }, [authHeaders]);

  const fetchNextOrderNumber = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/orders/next-number`, {
      headers: authHeaders(),
    });
    setNextOrderNumber(response.data.next_order_number);
  }, [authHeaders]);

  const refreshPageData = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      await Promise.all([fetchOrders(), fetchProducts(), fetchNextOrderNumber()]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [fetchNextOrderNumber, fetchOrders, fetchProducts]);

  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      try {
        await refreshPageData({ showLoading: false });
      } catch (error) {
        console.error('Error loading orders page:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, [refreshPageData]);

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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order and restore its product stock?')) return;

    await axios.delete(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      headers: authHeaders(),
    });
    await refreshOrdersAfterChange();
  };

  if (!token) return null;

  return (
    <div className="dashboard-wrapper" style={{ flex: 1 }}>
      <main className="main-content">
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Orders</h1>
            <p style={{ marginTop: '6px', color: '#666' }}>{orders.length} saved transaction{orders.length === 1 ? '' : 's'}</p>
          </div>
          <button className="submit-btn" type="button" onClick={() => setIsOrderModalOpen(true)}>
            New Order
          </button>
        </div>

        {message && (
          <div className="header" style={{ borderLeft: '4px solid #10b981', color: '#065f46' }}>
            {message}
          </div>
        )}

        <div className="content-box">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
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
                  <td colSpan="8">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8">No orders yet. Create a new order to save rows in orders and order_line_items.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_number || `ORD-${order.order_id}`}</td>
                    <td>{order.ordered_at ? new Date(order.ordered_at).toLocaleString() : '-'}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>{formatMoney(order.total_amount)}</td>
                    <td>{formatMoney(order.paid_amount || order.payment_amount)}</td>
                    <td>{formatMoney(order.change_amount)}</td>
                    <td>{order.payment_status}</td>
                    <td>
                      <button type="button" onClick={() => handleDeleteOrder(order.order_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    </div>
  );
}
