import { useState, useEffect } from 'react';
import api from '../../api';
import SelectField from '../../components/SelectField';

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [stages, setStages] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBatch, setNewBatch] = useState({ year: '', name: '' });
  const [newStage, setNewStage] = useState({ name: '', level: '', batch_id: '' });
  const [filterBatch, setFilterBatch] = useState('');
  const [filterStage, setFilterStage] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/batches'),
        api.get('/stages'),
      ]);
      setBatches(bRes.data);
      setStages(sRes.data);
    } catch (err) {
      setError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/batches', newBatch);
      setBatches((prev) => [...prev, res.data]);
      setNewBatch({ year: '', name: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء الدفعة');
    }
  };

  const createStage = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/stages', newStage);
      setStages((prev) => [...prev, res.data]);
      setNewStage({ name: '', level: '', batch_id: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء المرحلة');
    }
  };

  const deleteBatch = async (id) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    try {
      await api.delete(`/batches/${id}`);
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError('فشل حذف الدفعة');
    }
  };

  const deleteStage = async (id) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    try {
      await api.delete(`/stages/${id}`);
      setStages((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError('فشل حذف المرحلة');
    }
  };

  const fetchStudents = async () => {
    if (!filterBatch && !filterStage) return;
    try {
      const params = {};
      if (filterBatch) params.batch_id = filterBatch;
      if (filterStage) params.stage_id = filterStage;
      const res = await api.get('/students', { params });
      setStudents(res.data);
    } catch (err) {
      setError('فشل تحميل الطلاب');
    }
  };

  useEffect(() => { if (filterBatch || filterStage) fetchStudents(); }, [filterBatch, filterStage]);

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="page-header">إدارة الدفعات والمراحل</h1>

        {error && <div className="alert-error mb-6"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card border-gold-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">إضافة دفعة جديدة</h3>
            </div>
            <form onSubmit={createBatch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input type="text" placeholder="اسم الدفعة" value={newBatch.name} onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })} className="input-field" required />
              </div>
              <div className="w-full sm:w-32">
                <input type="number" placeholder="السنة" value={newBatch.year} onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })} className="input-field" required />
              </div>
              <button type="submit" className="btn-primary !px-5 !py-2.5 !text-sm w-full sm:w-auto">إضافة</button>
            </form>
          </div>

          <div className="card border-gold-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">إضافة مرحلة جديدة</h3>
            </div>
            <form onSubmit={createStage} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-[140px]">
                <SelectField
                  value={newStage.batch_id}
                  onChange={(e) => setNewStage({ ...newStage, batch_id: e.target.value })}
                  options={batches.map((b) => ({ value: String(b.id), label: `${b.name} (${b.year})` }))}
                  placeholder="اختر الدفعة"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <input type="text" placeholder="اسم المرحلة" value={newStage.name} onChange={(e) => setNewStage({ ...newStage, name: e.target.value })} className="input-field" required />
              </div>
              <div className="w-full sm:w-24">
                <input type="number" placeholder="المستوى" value={newStage.level} onChange={(e) => setNewStage({ ...newStage, level: e.target.value })} className="input-field" required />
              </div>
              <button type="submit" className="btn-primary !px-5 !py-2.5 !text-sm w-full sm:w-auto">إضافة</button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gold-500/8 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="font-bold text-white">الدفعات</h3>
                </div>
                {batches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد دفعات</div>
                ) : (
                  <div className="divide-y divide-gold-500/8">
                    {batches.map((b) => (
                      <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-gold-500/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gold-500/10 to-gold-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-white">{b.name}</span>
                            <span className="badge-gold !text-xs mr-2">{b.year}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteBatch(b.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gold-500/8 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="font-bold text-white">المراحل</h3>
                </div>
                {stages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد مراحل</div>
                ) : (
                  <div className="divide-y divide-gold-500/8">
                    {stages.map((s) => {
                      const batch = batches.find((b) => b.id === s.batch_id);
                      return (
                        <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gold-500/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gold-500/10 to-gold-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium text-white">{s.name}</span>
                              <span className="badge-gold !text-xs mr-2">مستوى {s.level}</span>
                              {batch && <span className="text-xs text-gray-500 mr-2">— {batch.name}</span>}
                            </div>
                          </div>
                          <button onClick={() => deleteStage(s.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">عرض الطلاب</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="label-text">الدُفعة</label>
                    <SelectField
                      value={filterBatch}
                      onChange={(e) => setFilterBatch(e.target.value)}
                      options={batches.map((b) => ({ value: String(b.id), label: `${b.name} (${b.year})` }))}
                      placeholder="كل الدفعات"
                    />
                  </div>
                <div>
                  <label className="label-text">المرحلة</label>
                  <SelectField
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                    placeholder="كل المراحل"
                  />
                </div>
              </div>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-[#141414]/50 rounded-xl">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>اختر الدفعة أو المرحلة لعرض الطلاب</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="w-full table-responsive-cards">
                    <thead>
                      <tr>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الاسم</th>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">رقم الطالب</th>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">المرحلة</th>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">هاتف الأب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/8">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-gold-500/5 transition-colors even:bg-gold-500/3">
                          <td className="px-4 py-3 text-white font-medium" data-label="الاسم">{st.fullName}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-sm" data-label="رقم الطالب">{st.student_id || st.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-400" data-label="المرحلة">{st.stage_name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-400" data-label="هاتف الأب">{st.fatherPhone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
