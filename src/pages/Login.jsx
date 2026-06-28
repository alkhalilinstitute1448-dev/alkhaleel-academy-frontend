import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function openWhatsApp() {
    const phone = '963937628458';
    const url = `https://wa.me/${phone}`;
    let detected = false;
    function onVisChange() {
      if (document.hidden) {
        detected = true;
        document.removeEventListener('visibilitychange', onVisChange);
      }
    }
    document.addEventListener('visibilitychange', onVisChange);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisChange);
      if (!detected) {
        setWaError('تعذر فتح واتساب. يرجى التأكد من تثبيت التطبيق على جهازك.');
        setTimeout(() => setWaError(''), 8000);
      }
    }, 2000);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,149,44,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(201,149,44,0.03),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="card p-0 overflow-hidden glass-glow">
          <div className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-5 sm:px-8">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/5 border-2 border-gold-500/20 flex items-center justify-center p-1 shadow-glow">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <img src="/logo.png" alt="أكاديمية الخليل" className="w-12 sm:w-16 h-12 sm:h-16 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-gold tracking-wide">أكاديمية الخليل</h1>
            <p className="text-gray-500 mt-2 text-sm">نظام إدارة الأكاديمية</p>
            <div className="w-12 h-0.5 bg-gradient-to-l from-gold-500/40 to-transparent mx-auto mt-3 sm:mt-4 rounded-full" />
          </div>

          <div className="px-5 sm:px-8 pb-8 sm:pb-10">
            {error && (
              <div className="alert-error mb-4 sm:mb-6">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="label-text">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="أدخل اسم المستخدم"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="label-text">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="أدخل كلمة المرور"
                  dir="rtl"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-base min-h-[48px]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    جاري تسجيل الدخول...
                  </span>
                ) : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                تواجه مشكلة؟{' '}
                <span onClick={openWhatsApp} className="text-gold-400 hover:text-gold-300 cursor-pointer transition-colors font-medium">التواصل مع الدعم التقني</span>
              </p>
              {waError && (
                <div className="alert-error mt-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{waError}</span>
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold-500/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#1c1c1c] px-4 text-xs text-gray-600">أو</span>
                </div>
              </div>
              <Link to="/register" className="btn-secondary w-full text-center inline-flex justify-center">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
