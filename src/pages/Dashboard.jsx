import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'student') {
      navigate('/student');
      return;
    }
    if (user.role === 'admin') {
      api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
    }
  }, [user, navigate]);

  if (!user) return null;

  const roleCards = {
    admin: [
      { title: 'الطلاب', count: stats?.students ?? 0, color: 'from-gold-500 to-gold-600', link: '/admin/users' },
      { title: 'المعلمون', count: stats?.teachers ?? 0, color: 'from-emerald-500 to-emerald-600', link: '/admin/users' },
      { title: 'الامتحانات', count: stats?.exams ?? 0, color: 'from-gold-500 to-gold-600', link: '/admin/exams' },
      { title: 'سجل التفقد', count: stats?.attendance ?? 0, color: 'from-gold-500 to-gold-600', link: '/attendance' },
    ],
    teacher: [
      { title: 'إدخال الدرجات', desc: 'تسجيل درجات الطلاب', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', link: '/teacher/grades' },
      { title: 'إدارة الامتحانات', desc: 'إنشاء وإدارة الامتحانات', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', link: '/teacher/exams' },
    ],
    attendance_officer: [
      { title: 'سجل التفقد', desc: 'تسجيل حضور وغياب الطلاب', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', link: '/attendance' },
    ],
  };

  const cards = roleCards[user.role] || [];

  return (
    <div dir="rtl" className="min-h-screen app-bg">
      <nav className="topbar">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-glow shrink-0">
            <span className="text-black font-bold text-[10px] sm:text-xs">الخليل</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-gradient-gold truncate">أكاديمية الخليل</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-400 truncate max-w-[80px] sm:max-w-[160px]">{user.fullName || user.username}</span>
          <span className="badge-gold text-[10px] sm:text-xs">{user.role}</span>
          <button onClick={logout} className="btn-danger !px-2 sm:!px-4 !py-1.5 sm:!py-2 !text-xs sm:!text-sm shadow-lg shadow-red-500/20">تسجيل الخروج</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="page-header">لوحة التحكم</h2>

        {user.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, i) => (
              <Link key={i} to={card.link} className="card p-6 hover:shadow-xl hover:shadow-gold-500 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white text-xl font-bold">{card.count}</span>
                </div>
                <h3 className="text-white font-bold text-lg">{card.title}</h3>
              </Link>
            ))}
          </div>
        )}

        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/users" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">إدارة المستخدمين</h3>
              <p className="text-gray-400 text-sm mt-1">عرض وإدارة حسابات المستخدمين</p>
            </Link>
            <Link to="/admin/batches" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">إدارة الدفعات والمراحل</h3>
              <p className="text-gray-400 text-sm mt-1">إنشاء وتعديل الدفعات والمراحل</p>
            </Link>
            <Link to="/admin/exams" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">إدارة الامتحانات</h3>
              <p className="text-gray-400 text-sm mt-1">إنشاء وعرض نتائج الامتحانات</p>
            </Link>
            <Link to="/admin/curriculum" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">إدارة المنهاج</h3>
              <p className="text-gray-400 text-sm mt-1">رفع وإدارة ملفات المنهاج</p>
            </Link>
            <Link to="/attendance" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">سجل التفقد</h3>
              <p className="text-gray-400 text-sm mt-1">تسجيل حضور وغياب الطلاب</p>
            </Link>
            <Link to="/admin/batches" className="card group text-center hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">عرض الطلاب</h3>
              <p className="text-gray-400 text-sm mt-1">عرض الطلاب حسب الدفعة والمرحلة</p>
            </Link>
          </div>
        )}

        {user.role === 'teacher' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <Link key={i} to={card.link} className="card group text-center hover:border-gold-500/30 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.desc}</p>
              </Link>
            ))}
          </div>
        )}

        {user.role === 'attendance_officer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <Link key={i} to={card.link} className="card group text-center hover:border-gold-500/30 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.desc}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
