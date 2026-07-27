import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './AdminDashboard.css';

const API_BASE_URL = '';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data.map(item => ({
                    name: item.product_name,
                    stock: item.stock_quantity
                }));

                setChartData(data);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            setCustomersLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCustomers(res.data || []);
            } catch (e) {
                console.error('Failed to fetch customers', e);
                setCustomers([]);
            } finally {
                setCustomersLoading(false);
            }
        };
        run();
    }, []);

    return (
        <div className="dashboard-wrapper" style={{ flex: 1 }}>
            <main className="main-content">
                <div className="page-header">
                    <h1>Dashboard Overview</h1>
                    <p className="subtitle">Monitor your store performance</p>
                </div>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="card-title">Inventory Levels</span>
                        <span className="card-badge">{chartData.length} products</span>
                    </div>
                    <div className="admin-card-body" style={{ padding: '24px' }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <Tooltip />
                                    <Bar dataKey="stock" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="admin-card" style={{ marginTop: '24px' }}>
                    <div className="admin-card-header">
                        <span className="card-title">Recent Customers</span>
                        <span className="card-badge">{customers.length} total</span>
                    </div>
                    <div className="admin-card-body">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Number</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customersLoading ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                                ) : customers.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No customers yet.</td></tr>
                                ) : (
                                    customers.slice(0, 5).map((c) => (
                                        <tr key={c.customer_id}>
                                            <td>{c.customer_id}</td>
                                            <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                                            <td>{c.number}</td>
                                            <td>{c.location}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

