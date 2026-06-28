import { useState, useEffect } from 'react';
import api from '../../api';
import SelectField from '../../components/SelectField';

const roles = ['admin', 'teacher', 'student', 'attendance_officer'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'student' });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/users', newUser);
      setUsers((prev) => [...prev, res.data]);
      setShowForm(false);
      setNewUser({ username: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء المستخدم');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditData({ username: user.username, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/users/${id}`, editData);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      setEditingId(null);
    } catch (err) {
      setError('فشل تحديث المستخدم');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError('فشل حذف المستخدم');
    }
  };

  const unlockDevice = async (id) => {
    try {
      await api.post(`/users/${id}/unlock-device`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, device_id: null } : u)));
    } catch (err) {
      setError('فشل إلغاء ربط الجهاز');
    }
  };

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-header !mb-0">إدارة المستخدمين</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary !px-5 !py-2.5 !text-sm">
            {showForm ? 'إلغاء' : 'إضافة مستخدم جديد'}
          </button>
        </div>

        {error && <div className="alert-error mb-6"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}

        {showForm && (
          <div className="card mb-6 border-gold-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">إنشاء مستخدم جديد</h3>
            </div>
            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label-text">اسم المستخدم</label>
                <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-text">كلمة المرور</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-text">الدور</label>
                <SelectField value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} options={roles} />
              </div>
              <div className="md:col-span-3">
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? (
                    <span className="flex items-center gap-2"><div className="spinner" />جاري الإنشاء...</span>
                  ) : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="table-wrap">
              <table className="w-full table-responsive-cards">
                <thead>
                  <tr>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">اسم المستخدم</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الدور</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الجهاز</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الحالة</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">تاريخ الإنشاء</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/8">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gold-500/5 transition-colors duration-150 even:bg-gold-500/3">
                      <td className="px-6 py-4" data-label="اسم المستخدم">
                        {editingId === u.id ? (
                          <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="input-field !py-2 !text-sm" />
                        ) : (
                          <span className="text-white font-medium">{u.username}</span>
                        )}
                      </td>
                      <td className="px-6 py-4" data-label="الدور">
                        {editingId === u.id ? (
                          <SelectField value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} options={roles} compact />
                        ) : (
                          <span className="badge-gold">{u.role}</span>
                        )}
                      </td>
                      <td className="px-6 py-4" data-label="الجهاز">
                        <span className={`text-sm font-mono ${u.device_id ? 'text-gray-400' : 'text-gray-500'}`}>
                          {u.device_id ? u.device_id.slice(0, 16) + '...' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4" data-label="الحالة">
                        {u.is_active ? <span className="badge-emerald">نشط</span> : <span className="badge-red">غير نشط</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500" data-label="تاريخ الإنشاء">{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className="px-6 py-4" data-label="">
                        <div className="flex items-center gap-2 justify-end">
                          {editingId === u.id ? (
                            <>
                              <button onClick={() => saveEdit(u.id)} className="btn-primary !px-3 !py-1.5 !text-xs">حفظ</button>
                              <button onClick={cancelEdit} className="btn-secondary !px-3 !py-1.5 !text-xs">إلغاء</button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(u)} className="btn-ghost !px-3 !py-1.5 !text-xs">تعديل</button>
                          )}
                          {u.device_id && (
                            <button onClick={() => unlockDevice(u.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-700">إلغاء ربط الجهاز</button>
                          )}
                          <button onClick={() => deleteUser(u.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">لا يوجد مستخدمون</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
