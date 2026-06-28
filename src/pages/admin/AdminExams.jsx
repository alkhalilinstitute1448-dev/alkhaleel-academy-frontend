import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import SelectField from '../../components/SelectField';

export default function AdminExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newExam, setNewExam] = useState({
    title: '', stageId: '', subject: '', startTime: '', endTime: '', durationMinutes: '',
  });
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [resultsView, setResultsView] = useState(null);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    Promise.all([
      api.get('/exams'),
      api.get('/stages'),
    ]).then(([eRes, sRes]) => {
      setExams(eRes.data);
      setStages(sRes.data);
    }).catch(() => setError('فشل تحميل البيانات'))
    .finally(() => setLoading(false));
  }, []);

  const createExam = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(newExam).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('file', file);
      const res = await api.post('/exams', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedCode(res.data.code);
      setExams((prev) => [...prev, res.data]);
      setNewExam({ title: '', stageId: '', subject: '', startTime: '', endTime: '', durationMinutes: '' });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء الامتحان');
    } finally {
      setCreating(false);
    }
  };

  const viewResults = async (examId) => {
    try {
      const res = await api.get(`/exams/${examId}/results`);
      setResultsView(res.data);
    } catch (err) {
      setError('فشل تحميل النتائج');
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err) {
      setError('فشل حذف الامتحان');
    }
  };

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="page-header">إدارة الامتحانات</h1>

        {error && <div className="alert-error mb-6"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}

        <div className="card mb-8 border-gold-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">إنشاء امتحان جديد</h3>
          </div>
          <form onSubmit={createExam} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="label-text">عنوان الامتحان</label>
              <input type="text" value={newExam.title} onChange={(e) => setNewExam({ ...newExam, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-text">المرحلة</label>
              <SelectField
                value={newExam.stageId}
                onChange={(e) => setNewExam({ ...newExam, stageId: e.target.value })}
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder="اختر المرحلة"
              />
            </div>
            <div>
              <label className="label-text">المادة</label>
              <input type="text" value={newExam.subject} onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-text">تاريخ البداية</label>
              <input type="datetime-local" value={newExam.startTime} onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-text">تاريخ النهاية</label>
              <input type="datetime-local" value={newExam.endTime} onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-text">المدة (دقائق)</label>
              <input type="number" value={newExam.durationMinutes} onChange={(e) => setNewExam({ ...newExam, durationMinutes: e.target.value })} className="input-field" required />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="label-text">ملف الامتحان (اختياري)</label>
              <div className="relative">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-br file:from-gold-500 file:to-gold-600 file:text-black file:font-medium file:cursor-pointer hover:file:shadow-lg transition-all" />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? (
                  <span className="flex items-center gap-2"><div className="spinner" />جاري الإنشاء...</span>
                ) : 'إنشاء الامتحان'}
              </button>
            </div>
          </form>

          {generatedCode && (
            <div className="alert-success mt-6">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">تم إنشاء الامتحان بنجاح</p>
                <p className="mt-1">كود الامتحان: <span className="font-mono font-bold text-lg text-gold-400 bg-[#1c1c1c] px-3 py-1 rounded-lg border border-green-200 inline-block mt-1">{generatedCode}</span></p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-500/8 flex items-center gap-3">
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-white">الامتحانات</h3>
            </div>
            {exams.length === 0 ? (
              <div className="text-center py-12 text-gray-500">لا توجد امتحانات</div>
            ) : (
              <div className="table-wrap">
                <table className="w-full table-responsive-cards">
                  <thead>
                    <tr>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">العنوان</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">المادة</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">المرحلة</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الكود</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">المدة</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">التاريخ</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/8">
                    {exams.map((ex) => {
                      const stage = stages.find((s) => s.id === ex.stageId);
                      return (
                        <tr key={ex.id} className="hover:bg-gold-500/5 transition-colors even:bg-gold-500/3">
                          <td className="px-6 py-4 font-medium text-white" data-label="العنوان">{ex.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-400" data-label="المادة">{ex.subject}</td>
                          <td className="px-6 py-4 text-sm text-gray-400" data-label="المرحلة">{stage?.name || '—'}</td>
                          <td className="px-6 py-4" data-label="الكود">
                            <span className="font-mono text-xs bg-gold-500/8 text-gold-300 px-2.5 py-1 rounded-lg border border-gold-500/10">{ex.code}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400" data-label="المدة">{ex.durationMinutes} دقيقة</td>
                          <td className="px-6 py-4 text-sm text-gray-500" data-label="التاريخ">
                            {ex.startTime ? new Date(ex.startTime).toLocaleDateString('ar-SA') : '—'}
                          </td>
                          <td className="px-6 py-4" data-label="">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => viewResults(ex.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700">النتائج</button>
                              {!isTeacher && (
                                <button onClick={() => deleteExam(ex.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

          {resultsView && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="card max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">نتائج الامتحان</h3>
                </div>
                <button onClick={() => setResultsView(null)} className="w-8 h-8 rounded-lg hover:bg-gold-500/5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {resultsView.length === 0 ? (
                <div className="text-center py-8 text-gray-500">لا توجد نتائج بعد</div>
              ) : (
                <div className="table-wrap">
                  <table className="w-full table-responsive-cards">
                    <thead>
                      <tr>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الطالب</th>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الدرجة</th>
                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/8">
                      {resultsView.map((r, i) => (
                        <tr key={i} className="hover:bg-gold-500/5 transition-colors">
                          <td className="px-4 py-3 text-white font-medium" data-label="الطالب">{r.studentName}</td>
                          <td className="px-4 py-3 text-gray-400" data-label="الدرجة">{r.score}</td>
                          <td className="px-4 py-3" data-label="الحالة">
                            {r.status === 'passed' ? <span className="badge-emerald">ناجح</span> : <span className="badge-red">راسب</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
