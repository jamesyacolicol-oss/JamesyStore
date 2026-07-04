import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Fetch product data for the chart
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/admin/products', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Map the API response to the format needed by the chart
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

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar remains the same */}
            <aside className="sidebar">
                <h2>Jamesy Store</h2>
                <nav>
                    <a href="/admin/dashboard">Dashboard</a>
                    <a href="/admin/products">Products</a>
                </nav>
            </aside>

            <main className="main-content">
                <div className="header">
                    <h1>Dashboard Overview</h1>
                </div>

                <div className="content-box">
                    <h3>Inventory Levels (Product Stock)</h3>
                    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="stock" fill="#0056b3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}