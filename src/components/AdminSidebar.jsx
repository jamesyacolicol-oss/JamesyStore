import { LayoutDashboard, LogOut, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const adminSidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Orders', href: '/admin/orders' },
];

const iconMap = {
  '/admin/dashboard': <LayoutDashboard size={20} />,
  '/admin/products': <Package size={20} />,
  '/admin/orders': <ShoppingCart size={20} />,
};

export default function AdminSidebar({ activeHref = '' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-nav-title">Jamesy Store Admin</div>

      <nav className="admin-nav">
        {adminSidebarItems.map((item) => (
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
