import { useMemo } from 'react';

export default function AdminOrderDetails({ open, onClose, order, formatMoney }) {
  const itemTotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity * item.ordered_price), 0);
  }, [order]);

  if (!open || !order) return null;

  return (
    <div
      className="admin-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="admin-modal-content receipt-modal"
        style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '8px',
          minWidth: '420px',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Receipt Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px dashed #333', paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '1px' }}>JAMESY STORE</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.85rem' }}>Official Receipt</p>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Order #:</span>
            <strong>{order.order_number || `ORD-${order.order_id}`}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Date:</span>
            <span>{order.ordered_at ? new Date(order.ordered_at).toLocaleString() : '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Customer:</span>
            <span>{order.customer_name || 'Walk-in'}</span>
          </div>
          {order.payment_method && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Payment:</span>
              <span style={{ textTransform: 'capitalize' }}>{order.payment_method}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>Price</th>
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={item.product_id || idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 4px' }}>
                  <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>{item.product_code}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '8px 4px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '8px 4px' }}>{formatMoney?.(item.ordered_price) || item.ordered_price}</td>
                <td style={{ textAlign: 'right', padding: '8px 4px' }}>{formatMoney?.(item.quantity * item.ordered_price) || (item.quantity * item.ordered_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ borderTop: '2px dashed #333', paddingTop: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '1rem' }}>
            <span>Total:</span>
            <strong>{formatMoney?.(order.total_amount) || order.total_amount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '1rem' }}>
            <span>Paid:</span>
            <strong>{formatMoney?.(order.paid_amount ?? order.payment_amount) || order.paid_amount || order.payment_amount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '1rem' }}>
            <span>Change:</span>
            <strong>{formatMoney?.(order.change_amount) || order.change_amount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Status:</span>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: order.payment_status === 'paid' ? '#d1fae5' : '#fee2e2',
                color: order.payment_status === 'paid' ? '#065f46' : '#991b1b',
              }}
            >
              {order.payment_status?.toUpperCase() || 'N/A'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ marginBottom: '16px', padding: '8px', background: '#f9fafb', borderRadius: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#666' }}>Notes:</span> {order.notes}
          </div>
        )}

        {/* Close Button */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 32px',
              background: '#0056b3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

