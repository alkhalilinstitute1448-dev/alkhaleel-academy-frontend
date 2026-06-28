import { useState, useEffect } from 'react';
import api from '../../api';
import SelectField from '../../components/SelectField';

export default function AttendancePanel() {
  const [batches, setBatches] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/batches'),
      api.get('/stages'),
    ]).then(([bRes, sRes]) => {
      setBatches(bRes.data);
      setStages(sRes.data);
    }).catch(() => {});
  }, []);

  const loadStudents = async () => {
    if (!selectedBatch && !selectedStage) return;
    setLoading(true);
    setError('');
    const params = {};
    if (selectedBatch) params.batch_id = selectedBatch;
    if (selectedStage) params.stage_id = selectedStage;
    try {
      const res = await api.get('/students', { params });
      setStudents(res.data);
      const init = {};
      res.data.forEach((st) => { init[st.id] = 'present'; });
      setAttendance(init);
    } catch (err) {
      setError('فشل تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [selectedBatch, selectedStage]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!date) {
      setError('يرجى اختيار التاريخ');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        date,
        status,
      }));
      await api.post('/attendance', { records });
      setSuccess('تم تسجيل الحضور بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الحضور');
    } finally {
      setSaving(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    const params = {};
    if (selectedBatch) params.batch_id = selectedBatch;
    if (selectedStage) params.stage_id = selectedStage;
    if (date) params.date = date;
    try {
      const res = await api.get('/attendance', { params });
      setRecords(res.data);
      setShowRecords(true);
    } catch (err) {
      setError('فشل تحميل سجل التفقد');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-yellow-500',
    excused: 'bg-gray-400',
  };

  const statusLabels = {
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'معذر',
  };

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="page-header mb-0">سجل التفقد</h1>
          <button
            onClick={() => setShowRecords(!showRecords)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${
              showRecords
                ? 'btn-secondary'
                : 'btn-primary'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showRecords ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                )}
              </svg>
              {showRecords ? 'تسجيل حضور' : 'عرض السجل'}
            </span>
          </button>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}
        {success && <div className="alert-success mb-6">{success}</div>}

        <div className="card mb-6 border-gold-500/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label-text">التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">الدفعة</label>
              <SelectField
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                options={batches.map((b) => ({ value: String(b.id), label: b.name }))}
                placeholder="كل الدفعات"
              />
            </div>
            <div>
              <label className="label-text">المرحلة</label>
              <SelectField
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder="كل المراحل"
              />
            </div>
            <div className="flex items-end">
              <button onClick={loadRecords} className="w-full btn-secondary">
                عرض السجل
              </button>
            </div>
          </div>
        </div>

        {showRecords ? (
          <div className="card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-500/8 bg-gradient-to-l from-gold-500 to-gold-600">
              <h3 className="font-bold text-white">سجل الحضور</h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="spinner"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-medium">لا توجد سجلات</div>
            ) : (
              <div className="table-wrap">
                <table className="table-responsive-cards">
                  <thead>
                    <tr>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الطالب</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">التاريخ</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/8">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-gold-500/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white" data-label="الطالب">{r.studentName || r.student_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-400" data-label="التاريخ">{r.date ? new Date(r.date).toLocaleDateString('ar-SA') : '—'}</td>
                        <td className="px-6 py-4" data-label="الحالة">
                          <span className={`badge ${
                            r.status === 'present' ? 'badge-emerald' :
                            r.status === 'absent' ? 'badge-red' :
                            r.status === 'late' ? 'badge-amber' :
                            'badge-gold'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ml-1.5 ${
                              r.status === 'present' ? 'bg-green-500' :
                              r.status === 'absent' ? 'bg-red-500' :
                              r.status === 'late' ? 'bg-amber-500' :
                              'bg-gold-400'
                            }`}></span>
                            {statusLabels[r.status] || r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="spinner"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="card text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 font-medium">اختر الدفعة أو المرحلة لعرض الطلاب</p>
              </div>
            ) : (
              <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gold-500/8 bg-gradient-to-l from-gold-500 to-gold-600">
                  <h3 className="font-bold text-white">تسجيل الحضور - {date}</h3>
                </div>
                <div className="divide-y divide-gold-500/8">
                  {students.map((st) => (
                    <div key={st.id} className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gold-500/5 transition-colors">
                      <span className="font-medium text-white text-sm sm:text-base">{st.fullName}</span>
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                        {['present', 'absent', 'late', 'excused'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatus(st.id, status)}
                            className={`px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-xl transition-all duration-200 font-medium min-h-[38px] sm:min-h-0 flex-1 sm:flex-none ${
                              attendance[st.id] === status
                                ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                                : 'btn-status-inactive'
                            }`}
                          >
                            {statusLabels[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-gold-500/8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-white">{students.length}</span> طالب
                  </span>
                  <button onClick={submitAttendance} disabled={saving} className="btn-primary">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </span>
                    ) : 'حفظ السجل'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
