import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const cards = [
    {
      title: 'إدارة المستخدمين',
      desc: 'عرض وإضافة وتعديل المستخدمين',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      link: '/admin/users',
    },
    {
      title: 'إدارة الدفعات والمراحل',
      desc: 'إنشاء وتعديل الدفعات والمراحل الدراسية',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      link: '/admin/batches',
    },
    {
      title: 'إدارة الامتحانات',
      desc: 'إنشاء وعرض نتائج الامتحانات',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      link: '/admin/exams',
    },
    {
      title: 'إدارة المنهاج',
      desc: 'رفع وإدارة ملفات المنهاج الدراسي',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      link: '/admin/curriculum',
    },
    {
      title: 'سجل التفقد',
      desc: 'تسجيل حضور وغياب الطلاب',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      link: '/attendance',
    },
    {
      title: 'عرض الطلاب',
      desc: 'عرض الطلاب مع إمكانية التصفية حسب الدفعة والمرحلة',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      link: '/admin/batches',
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen app-bg">
      <nav className="topbar">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-glow shrink-0">
            <span className="text-black font-bold text-[10px] sm:text-xs">الخليل</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-gradient-gold truncate">لوحة الإدارة</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/dashboard" className="btn-ghost !px-2 sm:!px-3 !py-1.5 !text-xs sm:!text-sm text-gray-400 hover:text-gold-400">الرئيسية</Link>
          <span className="text-xs sm:text-sm text-gray-400 truncate max-w-[80px] sm:max-w-[160px]">{user?.fullName || user?.username}</span>
          <button onClick={logout} className="btn-danger !px-2 sm:!px-4 !py-1.5 sm:!py-2 !text-xs sm:!text-sm shadow-lg shadow-red-500/20">تسجيل الخروج</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="page-header">إدارة النظام</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Link key={i} to={card.link} className="card group hover:border-gold-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-gold-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-gold-500/30 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={card.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
