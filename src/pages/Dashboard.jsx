import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BankStatements from '../components/BankStatements';
import Form16 from '../components/Form16';
import Payslips from '../components/Payslips';
import InvoiceProcessing from '../components/InvoiceProcessing';
import Home from '../components/Home';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/dashboard/bank-statements', label: 'Bank Statements', icon: '🏦' },
    { path: '/dashboard/form16', label: 'Form 16', icon: '📋' },
    { path: '/dashboard/payslips', label: 'Payslips', icon: '💰' },
    { path: '/dashboard/invoice-processing', label: 'Invoice Processing', icon: '📄' },
  ];

  const handleDrawerToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapse = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar onMenuClick={handleDrawerToggle} />
      
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          <button 
            className="btn-icon"
            onClick={handleSidebarCollapse}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <span className="icon">{item.icon}</span>
              <div className="flex-1">
                <div>{item.label}</div>
              </div>
            </button>
          ))}
        </nav>
        {/* <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div> */}
      </aside>

      <main className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bank-statements" element={<BankStatements />} />
            <Route path="/form16" element={<Form16 />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/invoice-processing" element={<InvoiceProcessing />} />
          </Routes>
        </div>
      </main>
    </div>
  );
} 