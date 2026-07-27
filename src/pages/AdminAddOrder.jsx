import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Search, Minus, UserPlus, ShoppingCart } from 'lucide-react';
import './AdminAddOrder.css';

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
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setCartItems([]);
      setSearchTerm('');
      setCustomerName('');
      setCustomerAddress('');
      setPaymentAmount('');
      setErrorMsg('');
    }
  }, [open]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products || [];
    const q = searchTerm.toLowerCase();
    return (products || []).filter(
      (p) =>
        (p.product_name && p.product_name.toLowerCase().includes(q)) ||
        (p.product_code && p.product_code.toLowerCase().includes(q))
    );
  }, [products, searchTerm]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          product_code: product.product_code || '-',
          product_name: product.product_name,
          price: Number(product.price) || 0,
          quantity: 1,
          stock: Number(product.stock_quantity) || 0,
        },
      ];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) {
            setErrorMsg(`Only ${item.stock} in stock for "${item.product_name}"`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const changeAmount = useMemo(() => {
    const paid = Number(paymentAmount) || 0;
    return paid >= subtotal ? paid - subtotal : 0;
  }, [paymentAmount, subtotal]);

  const getTokenValue = typeof getToken === 'function' ? getToken() : '';

  const handleSubmit = async () => {
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Add at least one product to the order.');
      return;
    }

    const paid = Number(paymentAmount) || 0;
    if (paid < subtotal) {
      setErrorMsg(`Payment amount (${formatMoney(paid)}) is less than total (${formatMoney(subtotal)}).`);
      return;
    }

    setSubmitting(true);
    try {
      let customerId = null;

      if (customerName.trim()) {
        try {
          const custRes = await axios.post(
            `${baseUrl || ''}/api/admin/customers`,
            {
              customer_name: customerName.trim(),
              number: null,
              address: customerAddress.trim() || null,
            },
            { headers: { Authorization: `Bearer ${getTokenValue}` } }
          );
          customerId = custRes.data?.customer?.customer_id || null;
        } catch (custErr) {
          console.error('Failed to create customer:', custErr);
          setErrorMsg('Warning: Could not save customer info, but order will proceed.');
        }
      }

      const payload = {
        customer_id: customerId,
        order_number: generatedOrderNum || String(Date.now()),
        subtotal,
        total_amount: subtotal,
        payment_amount: paid,
        paid_amount: paid,
        change_amount: changeAmount,
        payment_method: 'cash',
        payment_status: 'paid',
        status: 'paid',
        notes: customerName ? `Customer: ${customerName}` : null,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await axios.post(`${baseUrl || ''}/api/admin/orders`, payload, {
        headers: { Authorization: `Bearer ${getTokenValue}` },
      });

      if (typeof onSuccess === 'function') {
        onSuccess(`Order #${generatedOrderNum} created successfully!${customerId ? ' Customer saved to directory.' : ''}`);
      }
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

if (!open) return null;

  const cartCount = cartItems.length;

  return (
    <div className="new-order-overlay" onClick={onClose}>
      <div className="new-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="new-order-header">
          <div>
            <h2>
              <ShoppingCart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              New Order
            </h2>
            <p className="order-num">Order #{generatedOrderNum || '...'}</p>
          </div>
          <button className="new-order-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="new-order-error">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        {/* Body */}
        <div className="new-order-body">
          <div className="new-order-split">
            {/* Left - Search Products */}
            <div className="new-order-left">
              <h3>
                <Search size={16} /> Add Products
              </h3>
              <div className="search-wrapper">
                <Search size={17} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="product-list">
                {filteredProducts.length === 0 ? (
                  <div className="product-empty">
                    {searchTerm ? 'No products match your search.' : 'No products available.'}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.product_id}
                      className="product-item"
                      onClick={() => addToCart(product)}
                    >
                      <div className="product-item-left">
                        <span className="product-item-name">{product.product_name}</span>
                        <span className="product-item-meta">
                          {product.product_code} &middot; Stock: {product.stock_quantity ?? 0}
                        </span>
                      </div>
                      <div className="product-item-right">
                        <span className="product-item-price">{formatMoney(product.price)}</span>
                        <span className="product-item-add">
                          <Plus size={16} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right - Cart */}
            <div className="new-order-right">
              <h3>
                <ShoppingCart size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Cart ({cartCount} item{cartCount === 1 ? '' : 's'})
              </h3>
              <div className="cart-list">
                {cartItems.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingCart size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <br />
                    Cart is empty. Search and add products.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product_id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.product_name}</div>
                        <div className="cart-item-price">{formatMoney(item.price)} each</div>
                      </div>
                      <div className="cart-item-controls">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="cart-qty">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus size={13} />
                        </button>
                        <span className="cart-item-total">
                          {formatMoney(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="cart-qty-btn remove"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Info */}
              <div className="customer-section">
                <h4>
                  <UserPlus size={15} /> Customer Information
                </h4>
                <div className="customer-row">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                  />
                </div>
                <div className="customer-row">
                  <label>Address</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. City / Province"
                  />
                </div>
                {customerName.trim() && (
                  <p className="customer-save-note">Will be saved to customer directory.</p>
                )}
              </div>

              {/* Payment */}
              <div className="payment-section">
                <div className="payment-row">
                  <span className="label">Subtotal</span>
                  <span className="value">{formatMoney(subtotal)}</span>
                </div>
                <div className="payment-row">
                  <span className="label">Payment</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="payment-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="payment-row">
                  <span className="label">Change</span>
                  <span className={`value ${changeAmount > 0 ? 'green' : ''}`}>
                    {formatMoney(changeAmount)}
                  </span>
                </div>
                <button
                  type="button"
                  className={`submit-btn ${submitting ? 'submitting' : ''}`}
                  onClick={handleSubmit}
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting
                    ? 'Creating Order...'
                    : `Complete Order — ${formatMoney(subtotal)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

