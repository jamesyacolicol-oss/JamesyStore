import { Navigate, Outlet, useLocation } from 'react-router-dom';
import StaffSidebar from '../components/StaffSidebar';

export default function StaffLayout() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout" style={{ display: 'flex' }}>
      <StaffSidebar activeHref={location.pathname} />
      <Outlet />
    </div>
  );
}

