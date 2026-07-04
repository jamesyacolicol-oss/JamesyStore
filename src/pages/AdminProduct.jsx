import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminProduct() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:8000/api/admin/products', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="dashboard-wrapper" style={{ flex: 1 }}>
            <main className="main-content">
                <div className="header admin-page-header">
                    <h1>Products Management</h1>
                    <button onClick={() => navigate('/admin/add-product')} className="add-btn">
                        <Plus size={18} />
                        <span>Add New Product</span>
                    </button>
                </div>
                
                <div className="content-box">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product Code</th>
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
                                    <td>{product.stock_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}