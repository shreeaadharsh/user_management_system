import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;

      const res = await usersAPI.updateUser(user._id, payload);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
      setForm({ name: res.data.data.name, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800 }}>My Profile</h1>
        <p className="text-muted text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <div className="profile-header-card mb-6">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-badges">
            <Badge type={user?.role}>{user?.role}</Badge>
            <Badge type={user?.status}>{user?.status}</Badge>
          </div>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {/* Account Info */}
      {!editing && (
        <div className="card mb-4">
          <div className="section-title">Account Information</div>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role</span>
              <span className="detail-value" style={{ textTransform:'capitalize' }}>{user?.role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value" style={{ textTransform:'capitalize' }}>{user?.status}</span>
            </div>
          </div>
          <div style={{
            marginTop: 16, padding: '10px 16px',
            background: 'var(--warning-light)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--warning)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Your role is managed by an administrator and cannot be changed here.
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="card">
          <div className="section-title">Edit Profile</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity:0.5, cursor:'not-allowed' }} />
              <div className="form-error" style={{ color:'var(--text-muted)' }}>Email cannot be changed from this view. Contact an admin.</div>
            </div>

            <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, marginTop:4 }}>
              <div className="section-title" style={{ fontSize:14 }}>Change Password</div>
              <p className="text-muted text-sm mb-4">Leave blank to keep your current password.</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    minLength={form.password ? 6 : undefined}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setError(''); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
