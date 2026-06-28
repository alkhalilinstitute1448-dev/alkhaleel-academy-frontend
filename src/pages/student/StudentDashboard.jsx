import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    Promise.all([
      api.get('/student/profile'),
      api.get('/student/grades'),
      api.get('/student/exams'),
      api.get('/student/attendance'),
      api.get('/student/curriculum'),
      api.get('/student/books'),
    ]).then(([pRes, gRes, eRes, aRes, cRes, bRes]) => {
      setProfile(pRes.data);
      setGrades(gRes.data);
      setExams(eRes.data);
      setAttendance(aRes.data);
      setCurriculum(cRes.data);
      setBooks(bRes.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  const attendanceColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-yellow-100 text-yellow-700';
      case 'excused': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const attendanceLabel = (status) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      case 'excused': return 'معذر';
      default: return status;
    }
  };

  const tabs = [
    { key: 'profile', label: 'الملف الشخصي' },
    { key: 'grades', label: 'الدرجات' },
    { key: 'exams', label: 'الامتحانات' },
    { key: 'attendance', label: 'سجل الحضور' },
    { key: 'curriculum', label: 'المنهاج' },
    { key: 'books', label: 'الكتب' },
  ];

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <nav className="topbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-md shadow-gold-500/30 shrink-0">
                <span className="text-white font-bold text-[10px] sm:text-sm">الخليل</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-white truncate">أكاديمية الخليل</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-[160px]">{user.fullName || user.username}</span>
              <button onClick={logout} className="btn-danger !px-2 sm:!px-4 !py-1.5 sm:!py-2 !text-xs sm:!text-sm">تسجيل الخروج</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="card !p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] text-center border-0 rounded-none">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-gold-500/20 overflow-hidden bg-[#0a0a0a]/50 flex items-center justify-center shadow-lg shadow-black/20">
                  <svg className="w-10 h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg">{profile?.fullName || user.fullName || user.username}</h3>
                <p className="text-gold-300 text-sm font-medium">طالب</p>
              </div>
              <div className="p-3 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium flex items-center gap-3 ${
                      activeTab === tab.key
                        ? 'bg-gold-500/15 text-gold-300'
                        : 'text-gray-400 hover:bg-gold-500/5 hover:text-gold-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="spinner !w-10 !h-10"></div>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <div className="card border-gold-500/10">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      الملف الشخصي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">الاسم الكامل</p>
                        <p className="font-medium text-white mt-1">{profile?.fullName || '—'}</p>
                      </div>
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">اسم المستخدم</p>
                        <p className="font-medium text-white mt-1">{user.username}</p>
                      </div>
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">المرحلة</p>
                        <p className="font-medium text-white mt-1">{profile?.stageName || '—'}</p>
                      </div>
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">الدفعة</p>
                        <p className="font-medium text-white mt-1">{profile?.batchName || '—'}</p>
                      </div>
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">اسم الأب</p>
                        <p className="font-medium text-white mt-1">{profile?.fatherName || '—'}</p>
                      </div>
                      <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                        <p className="text-sm text-gray-400">اسم الأم</p>
                        <p className="font-medium text-white mt-1">{profile?.motherName || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-l from-gold-500 to-gold-600">
                      <h3 className="font-bold text-white">الدرجات</h3>
                    </div>
                    {grades.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 font-medium">لا توجد درجات بعد</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-responsive-cards">
                          <thead>
                            <tr className="bg-[#141414] border-b border-gold-500/8">
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">المادة</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الدرجة</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الفصل</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">التاريخ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold-500/8">
                            {grades.map((g, i) => (
                              <tr key={i} className="hover:bg-gold-500/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white" data-label="المادة">{g.subject}</td>
                                <td className="px-6 py-4" data-label="الدرجة">
                                  <span className={`font-bold ${g.grade >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{g.grade}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400" data-label="الفصل">{g.term ? `الفصل ${g.term}` : '—'}</td>
                                <td className="px-6 py-4 text-sm text-gray-400" data-label="التاريخ">{g.created_at ? new Date(g.created_at).toLocaleDateString('ar-SA') : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'exams' && (
                  <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-l from-gold-500 to-gold-600">
                      <h3 className="font-bold text-white">نتائج الامتحانات</h3>
                    </div>
                    {exams.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 font-medium">لا توجد امتحانات بعد</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-responsive-cards">
                          <thead>
                            <tr className="bg-[#141414] border-b border-gold-500/8">
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الامتحان</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">المادة</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الدرجة</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold-500/8">
                            {exams.map((e, i) => (
                              <tr key={i} className="hover:bg-gold-500/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white" data-label="الامتحان">{e.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-400" data-label="المادة">{e.subject}</td>
                                <td className="px-6 py-4 font-bold text-white" data-label="الدرجة">{e.score ?? '—'}</td>
                                <td className="px-6 py-4" data-label="الحالة">
                                  {e.status === 'passed' ? (
                                    <span className="badge-emerald">ناجح</span>
                                  ) : e.status === 'failed' ? (
                                    <span className="badge-red">راسب</span>
                                  ) : (
                                    <span className="badge-gold">{e.status || '—'}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-l from-gold-500 to-gold-600">
                      <h3 className="font-bold text-white">سجل الحضور</h3>
                    </div>
                    {attendance.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 font-medium">لا توجد سجلات حضور</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-responsive-cards">
                          <thead>
                            <tr className="bg-[#141414] border-b border-gold-500/8">
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">التاريخ</th>
                              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold-500/8">
                            {attendance.map((a, i) => (
                              <tr key={i} className="hover:bg-gold-500/5 transition-colors">
                                <td className="px-6 py-4 text-white" data-label="التاريخ">{a.date ? new Date(a.date).toLocaleDateString('ar-SA') : '—'}</td>
                                <td className="px-6 py-4" data-label="الحالة">
                                  <span className={`badge ${
                                    a.status === 'present' ? 'badge-emerald' :
                                    a.status === 'absent' ? 'badge-red' :
                                    a.status === 'late' ? 'badge-amber' :
                                    'badge-gold'
                                  }`}>
                                    {attendanceLabel(a.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-l from-gold-500 to-gold-600">
                      <h3 className="font-bold text-white">المنهاج الدراسي</h3>
                    </div>
                    {curriculum.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 font-medium">لا توجد ملفات منهاج متاحة</div>
                    ) : (
                      <div className="divide-y divide-gold-500/8">
                        {curriculum.map((f, i) => (
                          <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gold-500/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gold-500/8 border border-gold-500/15 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-white">{f.title}</p>
                                <p className="text-sm text-gray-400">{f.fileName || 'ملف PDF'}</p>
                              </div>
                            </div>
                            <a href={`/api/curriculum/${f.id}/download`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                              تحميل
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'books' && (
                  <div className="card !p-0 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-l from-gold-500 to-gold-600">
                      <h3 className="font-bold text-white">حالة الكتب</h3>
                    </div>
                    {books.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 font-medium">لا توجد معلومات عن الكتب</div>
                    ) : (
                      <div className="divide-y divide-gold-500/8">
                        {books.map((b, i) => (
                          <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gold-500/5 transition-colors">
                            <div>
                              <p className="font-medium text-white">{b.title || b.name}</p>
                              <p className="text-sm text-gray-400">{b.description || ''}</p>
                            </div>
                            <span className={`badge ${
                              b.status === 'received' ? 'badge-emerald' :
                              b.status === 'pending' ? 'badge-amber' :
                              'badge-gold'
                            }`}>
                              {b.status === 'received' ? 'تم الاستلام' :
                               b.status === 'pending' ? 'قيد الانتظار' :
                               b.status || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
