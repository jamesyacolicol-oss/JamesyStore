import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProduct from './pages/AdminProduct';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminStaff from './pages/AdminStaff';
import StaffLayout from './pages/StaffLayout';
import StaffDashboard from './pages/StaffDashboard';
import StaffOrders from './pages/StaffOrders';
import StaffProducts from './pages/StaffProducts';
import StaffCustomers from './pages/StaffCustomers';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Admin Layout + Protected */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProduct />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="staff" element={<AdminStaff />} />
                </Route>

                {/* Staff Layout + Protected */}
                <Route path="/staff" element={<StaffLayout />}>
                    <Route path="dashboard" element={<StaffDashboard />} />
                    <Route path="orders" element={<StaffOrders />} />
                    <Route path="products" element={<StaffProducts />} />
                    <Route path="customers" element={<StaffCustomers />} />
                </Route>

                {/* Default redirect to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

