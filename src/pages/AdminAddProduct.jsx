import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminAddProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productCode, setProductCode] = useState('');
    const [formData, setFormData] = useState({
        product_name: '',
        category_name: '',
        price: '',
        stock_quantity: ''
    });

    // 1. Fetch the unique product code from API
    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/admin/products/next-code', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setProductCode(res.data.product_code);
            } catch (err) {
                console.error("Failed to fetch code", err);
            }
        };
        fetchCode();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Submit form with payload merging
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, product_code: productCode };
            
            await axios.post('http://127.0.0.1:8000/api/admin/products', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <main className="main-content">
                <div className="header">
                    <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={20}/></button>
                    <h1>Register New Inventory Item</h1>
                </div>

                <div className="content-box">
                    <form onSubmit={handleSubmit} className="admin-form">
                        
                        <div className="form-group">
                            <label>System Product Code</label>
                            <input value={productCode} readOnly className="readonly-input" />
                        </div>

                        <div className="form-group">
                            <label>Product Name</label>
                            <input name="product_name" onChange={handleChange} required placeholder="e.g. Piattos Cheese" />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <input name="category_name" onChange={handleChange} required placeholder="e.g. Snacks" />
                        </div>

                        {/* Flexbox row for Stock and Price */}
                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Stock Quantity</label>
                                <input name="stock_quantity" type="number" onChange={handleChange} required placeholder="0" />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Unit Price (PHP)</label>
                                <input name="price" type="number" step="0.01" onChange={handleChange} required placeholder="0.00" />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="spin" size={18} /> Saving...</>
                            ) : (
                                <><Save size={18} /> Save Product</>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}