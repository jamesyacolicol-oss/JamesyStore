import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout" style={{ display: 'flex' }}>
      <AdminSidebar activeHref={location.pathname} />
      <Outlet />
    </div>
  );
}
