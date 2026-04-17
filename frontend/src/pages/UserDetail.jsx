import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getUser(id)
      .then(res => setUser(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'User not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = async () => {
    if (!confirm(`Deactivate "${user.name}"?`)) return;
    try {
      await usersAPI.deleteUser(user._id);
      toast.success('User deactivated.');
      setUser(prev => ({ ...prev, status: 'inactive' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  if (loading) return (
    <div className="loading-overlay"><div className="spinner"></div><span className="loading-text">Loading user...</span></div>
  );

  if (error) return (
    <div className="empty-state">
      <div className="empty-state-icon"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
      <h3>Error</h3>
      <p>{error}</p>
      <button className="btn btn-secondary" style={{ marginTop:16 }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>Back</button>
        <h1 style={{ fontSize:22, fontWeight:800, flex:1 }}>User Details</h1>
        <div style={{ display:'flex', gap:10 }}>
          {(isAdmin || (currentUser.role === 'manager' && user.role !== 'admin')) && (
            <button className="btn btn-secondary" onClick={() => navigate('/users')}>
              Edit in List
            </button>
          )}
          {isAdmin && user._id !== currentUser._id && (
            <button className="btn btn-danger" onClick={handleDeactivate}>Deactivate</button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-header-card mb-6">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-badges">
            <Badge type={user.role}>{user.role}</Badge>
            <Badge type={user.status}>{user.status}</Badge>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="card mb-4">
        <div className="section-title">Account Details</div>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Role</span>
            <span className="detail-value" style={{ textTransform:'capitalize' }}>{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value" style={{ textTransform:'capitalize' }}>{user.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">User ID</span>
            <span className="detail-value" style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)' }}>{user._id}</span>
          </div>
        </div>
      </div>

      {/* Audit Info */}
      <div className="card">
        <div className="section-title">Audit Information</div>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Created At</span>
            <span className="detail-value">{new Date(user.createdAt).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created By</span>
            <span className="detail-value">
              {user.createdBy
                ? `${user.createdBy.name} (${user.createdBy.email})`
                : <span style={{ color:'var(--text-muted)' }}>System / Self-registered</span>}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Updated</span>
            <span className="detail-value">{new Date(user.updatedAt).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Updated By</span>
            <span className="detail-value">
              {user.updatedBy
                ? `${user.updatedBy.name} (${user.updatedBy.email})`
                : <span style={{ color:'var(--text-muted)' }}>—</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
