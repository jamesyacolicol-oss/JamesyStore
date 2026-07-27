import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

export default function StaffProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get('/api/staff/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="dashboard-wrapper" style={{ flex: 1 }}>
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Products</h1>
                        <p className="subtitle">View inventory and stock levels</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="card-title">Inventory List</span>
                        <span className="card-badge">{products.length} items</span>
                    </div>

                    {loading ? (
                        <div className="empty-state"><p>Loading products...</p></div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            </div>
                            <h3>No products yet</h3>
                            <p>No products available in inventory.</p>
                        </div>
                    ) : (
                        <div className="admin-card-body">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.product_id}>
                                            <td><strong>{product.product_code}</strong></td>
                                            <td>{product.product_name}</td>
                                            <td>{product.category?.category_name || 'N/A'}</td>
                                            <td>₱{parseFloat(product.price).toFixed(2)}</td>
                                            <td><span className={`status-badge ${parseInt(product.stock_quantity) > 0 ? 'paid' : 'cancelled'}`}>{product.stock_quantity}</span></td>
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

