import { useState, useEffect } from 'react';
import api from '../../api';
import SelectField from '../../components/SelectField';

export default function TeacherGrades() {
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('1');

  useEffect(() => {
    api.get('/stages').then((res) => setStages(res.data)).catch(() => {});
  }, []);

  const loadStudents = async () => {
    if (!selectedStage) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students', { params: { stage_id: selectedStage } });
      setStudents(res.data);
    } catch (err) {
      setError('فشل تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedStage) loadStudents(); }, [selectedStage]);

  const handleGradeChange = (studentId, value) => {
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const saveGrades = async () => {
    if (!subject) {
      setError('يرجى إدخال اسم المادة');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const entries = Object.entries(grades)
        .filter(([, v]) => v !== '' && v !== undefined)
        .map(([studentId, grade]) => ({
          studentId: parseInt(studentId),
          subject,
          grade: parseFloat(grade),
          term: parseInt(term),
          stageId: parseInt(selectedStage),
        }));
      if (entries.length === 0) {
        setError('يرجى إدخال درجات للطلاب');
        setSaving(false);
        return;
      }
      await api.post('/grades', { grades: entries });
      setSuccess('تم حفظ الدرجات بنجاح');
      setGrades({});
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ الدرجات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="page-header">إدخال الدرجات</h1>

        {error && <div className="alert-error mb-6">{error}</div>}
        {success && <div className="alert-success mb-6">{success}</div>}

        <div className="card mb-6 border-gold-500/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label-text">المرحلة</label>
              <SelectField
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder="اختر المرحلة"
              />
            </div>
            <div>
              <label className="label-text">المادة</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="اسم المادة" />
            </div>
            <div>
              <label className="label-text">الفصل</label>
              <SelectField
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                options={[
                  { value: '1', label: 'الفصل الأول' },
                  { value: '2', label: 'الفصل الثاني' },
                  { value: '3', label: 'الفصل الثالث' },
                ]}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">اختر مرحلة لعرض الطلاب</p>
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="table-wrap">
              <table className="table-responsive-cards">
                <thead>
                  <tr>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">#</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">اسم الطالب</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gold-400 uppercase tracking-wider bg-[#141414] border-b border-gold-500/10">الدرجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/8">
                  {students.map((st, i) => (
                    <tr key={st.id} className="hover:bg-gold-500/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500" data-label="#">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-white" data-label="اسم الطالب">{st.fullName}</td>
                      <td className="px-6 py-4" data-label="الدرجة">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grades[st.id] ?? ''}
                          onChange={(e) => handleGradeChange(st.id, e.target.value)}
                          className="w-full sm:w-24 input-field"
                          placeholder="0-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gold-500/8 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-white">{students.length}</span> طالب
              </span>
              <button onClick={saveGrades} disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </span>
                ) : 'حفظ الدرجات'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
