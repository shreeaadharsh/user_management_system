import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

// ─── Create User Form ────────────────────────────────────────────────────────
const CreateUserModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', status: 'active', autoGeneratePassword: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => setForm({ name: '', email: '', password: '', role: 'user', status: 'active', autoGeneratePassword: false });

  const handleClose = () => { reset(); setError(''); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await usersAPI.createUser(form);
      const { data, generatedPassword } = res.data;
      if (generatedPassword) {
        toast.success(`User created! Auto password: ${generatedPassword}`, { duration: 8000 });
      } else {
        toast.success('User created successfully!');
      }
      onCreated(data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User" subtitle="Add a new user to the system">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jane Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@example.com" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <input type="checkbox" checked={form.autoGeneratePassword} onChange={e => setForm({...form, autoGeneratePassword: e.target.checked})} />
            <span className="form-label" style={{ margin:0 }}>Auto-generate password</span>
          </label>
        </div>
        {!form.autoGeneratePassword && (
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" required={!form.autoGeneratePassword} minLength={6} />
          </div>
        )}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner"></span> Creating...</> : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Edit User Form ───────────────────────────────────────────────────────────
const EditUserModal = ({ isOpen, onClose, user, onUpdated, currentUserRole }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
  }, [user]);

  const handleClose = () => { setError(''); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await usersAPI.updateUser(user._id, form);
      toast.success('User updated successfully!');
      onUpdated(res.data.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" subtitle={`Editing ${user.name}`}>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
        </div>
        <div className="form-row">
          {currentUserRole === 'admin' && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role || 'user'} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {currentUserRole === 'admin' && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || 'active'} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main UserList Page ───────────────────────────────────────────────────────
const UserList = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getUsers({ page, limit: 10, search, role: roleFilter, status: statusFilter });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Open create modal if ?action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create' && isAdmin) {
      setShowCreate(true);
      setSearchParams({});
    }
  }, []);

  const handleDeactivate = async (userId, userName) => {
    if (!confirm(`Deactivate user "${userName}"? They will not be able to login.`)) return;
    try {
      await usersAPI.deleteUser(userId);
      toast.success(`${userName} deactivated.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user.');
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleUserUpdated = (updated) => {
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
  };

  const roles = ['', 'admin', 'manager', 'user'];
  const statuses = ['', 'active', 'inactive'];

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800 }}>User Management</h1>
          <p className="text-muted text-sm mt-1">Manage accounts, roles & permissions</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Create User
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">
            All Users <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:13 }}>({pagination.total})</span>
          </div>
          <div className="table-actions">
            <div className="search-input-wrapper">
              <span className="icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
              <input
                className="search-input"
                placeholder="Search name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="form-select" style={{ width:'auto', padding:'9px 14px' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            <select className="form-select" style={{ width:'auto', padding:'9px 14px' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner"></div><span className="loading-text">Loading users...</span></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="td-user">
                      <div className="td-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="td-name">{u.name}</div>
                        <div className="td-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge type={u.role}>{u.role}</Badge></td>
                  <td><Badge type={u.status}>{u.status}</Badge></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/users/${u._id}`)} title="View">View</button>
                      {(isAdmin || (currentUser.role === 'manager' && u.role !== 'admin')) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)} title="Edit">Edit</button>
                      )}
                      {isAdmin && u._id !== currentUser._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id, u.name)} title="Deactivate">
                          {u.status === 'active' ? 'Suspend' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total} users
            </div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.pages - 4)) + i;
                return p <= pagination.pages ? (
                  <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handleUserCreated} />
      <EditUserModal isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser} onUpdated={handleUserUpdated} currentUserRole={currentUser.role} />
    </div>
  );
};

export default UserList;
