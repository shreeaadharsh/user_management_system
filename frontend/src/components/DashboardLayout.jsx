import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();

  const roleLabel = user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal` : '';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">UserSphere</div>
            <div className="topbar-subtitle">{roleLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent-primary) 0%, #004494 100%)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:600 }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </header>
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
