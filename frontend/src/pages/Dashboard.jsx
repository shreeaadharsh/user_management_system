import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api';
import Badge from '../components/Badge';

const StatCard = ({ value, label, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
    <div className={`stat-icon ${color}`}>{icon}</div>
  </div>
);

const Dashboard = () => {
  const { user, isAdminOrManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminOrManager) {
      setLoading(true);
      usersAPI.getStats()
        .then(res => setStats(res.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAdminOrManager]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--accent-light), transparent)', borderColor: 'var(--accent-glow)' }}>
        <div style={{ fontSize: 32 }}>
          {user?.role === 'admin' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ) : user?.role === 'manager' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          )}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>
          {greeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted mt-1" style={{ fontSize: 14 }}>
          {user?.role === 'admin'
            ? 'You have full admin access to the UserSphere management system.'
            : user?.role === 'manager'
            ? 'You can view and manage regular users within the system.'
            : 'View and update your profile from the sidebar.'}
        </p>
        {isAdminOrManager && (
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/users')}>
              Manage Users
            </button>
            {isAdmin && (
              <button className="btn btn-secondary" onClick={() => navigate('/users?action=create')}>
                Add New User
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {isAdminOrManager && (
        <>
          <div className="section-title">System Overview</div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner"></div><span className="loading-text">Loading stats...</span></div>
          ) : (
            <div className="stats-grid">
              <StatCard value={stats?.total} label="Total Users" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} color="blue" />
              <StatCard value={stats?.active} label="Active Users" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>} color="green" />
              <StatCard value={stats?.inactive} label="Inactive Users" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>} color="red" />
              <StatCard value={stats?.byRole?.admin} label="Admins" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} color="yellow" />
            </div>
          )}

          {stats?.recentUsers?.length > 0 && (
            <>
              <div className="section-title mt-3">Recently Added</div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map(u => (
                      <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${u._id}`)}>
                        <td>
                          <div className="td-user">
                            <div className="td-avatar">{u.name.slice(0, 2)}</div>
                            <div>
                              <div className="td-name">{u.name}</div>
                              <div className="td-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge type={u.role}>{u.role}</Badge></td>
                        <td><Badge type={u.status}>{u.status}</Badge></td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Regular user dashboard */}
      {!isAdminOrManager && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
          <div className="card" style={{ cursor:'pointer' }} onClick={() => navigate('/profile')}>
            <div style={{ fontSize: 24, marginBottom: 16 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>My Profile</div>
            <div className="text-muted text-sm mt-1">View and update your account</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 24, marginBottom: 16 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Change Password</div>
            <div className="text-muted text-sm mt-1">Update your credentials securely</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 24, marginBottom: 16 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></div>
            <div style={{ fontWeight: 700, fontSize: 16, textTransform:'capitalize' }}>Role: {user?.role}</div>
            <div className="text-muted text-sm mt-1">Your current access level</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
