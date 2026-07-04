import { useMemo, useState } from 'react';

export default function AdminAddOrder({
  open,
  onClose,
  products,
  generatedOrderNum,
  onSuccess,
  formatMoney,
  baseUrl,
  getToken,
}) {
  const [cart, setCart] = useState([]);
  const [customerInput, setCustomerInput] = useState('');
  const [enterAmount, setEnterAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(
      (p) =>
        p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.product_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalPayment = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalChanges = useMemo(() => {
    const cash = Number(enterAmount);
    if (!cash || cash < totalPayment) return 0;
    return cash - totalPayment;
  }, [enterAmount, totalPayment]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((x) => x.product_id === product.product_id);
      if (existing) {
        return prevCart.map((x) =>
          x.product_id === product.product_id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.product_id,
          product_code: product.product_code, // Dito kinukuha ang code
          product_name: product.product_name,
          price: Number(product.price),
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQty = (productId, amt) => {
    setCart((prevCart) =>
      prevCart
        .map((x) => (x.product_id === productId ? { ...x, quantity: Math.max(0, x.quantity + amt) } : x))
        .filter((x) => x.quantity > 0)
    );
  };

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return alert('Cannot checkout an empty receipt.');
    if (Number(enterAmount) < totalPayment && totalPayment > 0) {
      return alert('Entered Amount cannot be less than Total Payment.');
    }

    const token = getToken();
    setSubmitting(true);

    const payload = {
      customer_id: Number(customerInput) || null,
      order_number: generatedOrderNum,
      total_amount: totalPayment,
      payment_amount: Number(enterAmount),
      change_amount: totalChanges,
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/admin/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit order.');
      onSuccess('Transaction completed!');
      setCart([]);
      setEnterAmount('');
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="admin-modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '500px', maxWidth: '90vw' }}>
        <h3>New POS Sale</h3>
        
        {/* Search and Input */}
        <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input placeholder="Search products..." style={{ flex: 1, padding: '8px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <input placeholder="Customer ID (optional)" style={{ flex: 1, padding: '8px' }} value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} />
        </div>

        {/* Product Grid */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
          {filteredProducts.map((p) => (
            <div key={p.product_id} onClick={() => addToCart(p)} style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', cursor: 'pointer', minWidth: '120px' }}>
              <div style={{ fontWeight: 'bold' }}>{p.product_name}</div>
              <div style={{ color: '#0056b3' }}>{formatMoney(p.price)}</div>
            </div>
          ))}
        </div>

        {/* Cart Table */}
        <table className="admin-table" style={{ width: '100%', marginBottom: '15px' }}>
          <thead>
            <tr><th>Code</th><th>Product</th><th>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.product_id}>
                <td>{item.product_code}</td> {/* Dito lumalabas ang Product Code */}
                <td>{item.product_name}</td>
                <td>
                  <button onClick={() => updateCartQty(item.product_id, -1)}>-</button>
                  {item.quantity}
                  <button onClick={() => updateCartQty(item.product_id, 1)}>+</button>
                </td>
                <td style={{ textAlign: 'right' }}>{formatMoney(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total:</span> <strong>{formatMoney(totalPayment)}</strong></div>
            <input type="number" placeholder="Enter Cash Amount" style={{ width: '100%', padding: '8px', marginTop: '10px' }} value={enterAmount} onChange={(e) => setEnterAmount(e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}><span>Change:</span> <strong>{formatMoney(totalChanges)}</strong></div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
            <button onClick={handleCheckoutSubmit} style={{ background: '#0056b3', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
                {submitting ? 'Saving...' : 'Confirm Checkout'}
            </button>
        </div>
      </div>
    </div>
  );
}