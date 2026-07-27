import { LayoutDashboard, LogOut, Package, ShoppingCart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const staffSidebarItems = [
  { label: 'Dashboard', href: '/staff/dashboard' },
  { label: 'Orders', href: '/staff/orders' },
  { label: 'Products', href: '/staff/products' },
  { label: 'Customers', href: '/staff/customers' },
];

const iconMap = {
  '/staff/dashboard': <LayoutDashboard size={20} />,
  '/staff/orders': <ShoppingCart size={20} />,
  '/staff/products': <Package size={20} />,
  '/staff/customers': <Users size={20} />,
};

export default function StaffSidebar({ activeHref = '' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-nav-title">Jamesy Store Staff</div>

      <nav className="admin-nav">
        {staffSidebarItems.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            className={`admin-nav-item ${activeHref === item.href ? 'active' : ''}`}
            aria-current={activeHref === item.href ? 'page' : undefined}
          >
            <span className="admin-icon">{iconMap[item.href]}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button type="button" onClick={handleLogout} className="logout-btn">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

