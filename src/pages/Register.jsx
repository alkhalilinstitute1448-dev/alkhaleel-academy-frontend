import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import api from '../api';
import SelectField from '../components/SelectField';
import { COUNTRIES, normalizePhone, buildFullPhone, extractLocalDigits } from '../utils/phone';

const STAGES = [
  'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع',
  'العاشر', 'الحادي عشر', 'الثانوية', 'جامعي', 'متخرج', 'لا يدرس',
];

const STATUS_OPTIONS = [
  { value: '', label: '-- اختر --' },
  { value: 'على قيد الحياة', label: 'على قيد الحياة' },
  { value: 'متوفى', label: 'متوفى' },
  { value: 'غير ذلك', label: 'غير ذلك' },
];

const initialForm = {
  fullName: '', fatherName: '', motherName: '',
  fatherStatus: '', motherStatus: '',
  fatherOccupation: '', motherOccupation: '',
  studentCountry: 'SY', fatherCountry: 'SY', motherCountry: 'SY',
  studentPhone: '', fatherPhone: '', motherPhone: '',
  primaryContact: 'father',
  birthYear: '', stage: '',
};

const FACE_OVERLAY = (
  <svg viewBox="0 0 640 480" className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
    <defs>
      <filter id="neonGlow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#neonGlow)" stroke="#00ffcc" strokeWidth="2" fill="none" opacity="0.7">
      <ellipse cx="320" cy="165" rx="100" ry="130" />
      <ellipse cx="320" cy="165" rx="100" ry="130" strokeWidth="1" strokeDasharray="6 4" opacity="0.35" />
      <line x1="250" y1="145" x2="270" y2="145" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="370" y1="145" x2="390" y2="145" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="320" y1="160" x2="320" y2="190" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M290 210 Q320 225 350 210" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M270 290 Q320 340 370 290" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </g>
  </svg>
);

const STABILITY_SECONDS = 18;

function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState('user');
  const [captured, setCaptured] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [stabilityTime, setStabilityTime] = useState(0);
  const stabilityInterval = useRef(null);
  const isStable = stabilityTime >= STABILITY_SECONDS;

  useEffect(() => {
    setCameraReady(false);
    setStabilityTime(0);
    startCamera(facing);
    return () => stopCamera();
  }, [facing]);

  useEffect(() => {
    if (!cameraReady || captured) return;
    stabilityInterval.current = setInterval(() => {
      setStabilityTime((prev) => {
        if (prev >= STABILITY_SECONDS - 1) {
          clearInterval(stabilityInterval.current);
          return STABILITY_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (stabilityInterval.current) clearInterval(stabilityInterval.current);
    };
  }, [cameraReady, captured]);

  function startCamera(f) {
    stopCamera();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: f, width: 640, height: 480 } })
      .then((s) => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraReady(true);
      })
      .catch(() => {});
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function capture() {
    if (!isStable) return;
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((blob) => {
      setCaptured(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.85);
  }

  function retake() {
    setCaptured(null);
    setStabilityTime(0);
    setCameraReady(false);
    startCamera(facing);
  }

  function confirm() {
    fetch(captured).then((r) => r.blob()).then((blob) => {
      onCapture(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
    });
    onClose();
  }

  function toggleFacing() {
    setFacing((f) => (f === 'user' ? 'environment' : 'user'));
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {!captured ? (
          <>
            <p className="text-center text-sm text-cyan-300 mb-3 font-medium leading-relaxed">
              ضع وجهك في وسط الإطار وحافظ على ثبات الوضع
              <br />ثم اضغط على زر الالتقاط عندما يصبح باللون الأخضر
            </p>
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-[4/3] object-cover"
                style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              {FACE_OVERLAY}
              <button
                type="button"
                onClick={toggleFacing}
                className="absolute bottom-3 left-3 w-11 h-11 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="mt-3 text-center">
              <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${isStable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                {isStable
                  ? '✅ ممتاز – تم تثبيت الوضع'
                  : `🟡 ممتاز – ثبت الوضع (${stabilityTime}/${STABILITY_SECONDS} ثانية)`}
              </span>
            </div>
            <div className="flex justify-center gap-5 mt-4">
              <button type="button" onClick={capture} disabled={!isStable} className={`w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center ${isStable ? 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/40 cursor-pointer' : 'bg-gray-600/50 cursor-not-allowed'}`}>
                <div className={`w-12 h-12 rounded-full transition-colors ${isStable ? 'bg-white' : 'bg-gray-400'}`} />
              </button>
              <button type="button" onClick={onClose} className="btn-secondary !px-5 self-center">إلغاء</button>
            </div>
          </>
        ) : (
          <>
            <img src={captured} alt="ملتقطة" className="w-full rounded-2xl border-2 border-gold-500/30" />
            <div className="mt-4 text-center">
              <h3 className="text-sm font-bold text-gold-400 mb-3">مراجعة الصورة</h3>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={confirm} className="btn-primary !px-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  تأكيد الصورة
                </button>
                <button type="button" onClick={retake} className="btn-secondary !px-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  إعادة التصوير
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CountryPhoneRow({ label, required, country, digits, onCountryChange, onDigitsChange, error, showOptional }) {
  const selected = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];
  const isSyria = selected.code === 'SY';
  const prefix = `${selected.dial}${selected.afterDial ? ' ' + selected.afterDial : ''}`;

  function handleDigitsChange(e) {
    const val = e.target.value;
    if (isSyria) {
      onDigitsChange(val);
    } else {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length <= selected.userDigits) {
        onDigitsChange(cleaned);
      }
    }
  }

  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.dial}` }));

  return (
    <div>
      <label className="label-text">{label} {required && <span className="text-red-400">*</span>}{showOptional && <span className="text-gray-500 text-xs mr-1">(اختياري)</span>}</label>
      <div className="flex flex-col sm:flex-row gap-2" dir="ltr">
        <div className="shrink-0 min-w-[130px] w-full sm:w-auto">
          <SelectField
            value={country}
            onChange={(e) => { onCountryChange(e.target.value); onDigitsChange(''); }}
            options={countryOptions}
            compact
          />
        </div>
        <div className="flex-1 flex">
          <span className="inline-flex items-center px-3 bg-[#252525] border border-gray-700/30 rounded-l-xl text-gray-400 text-sm font-mono whitespace-nowrap">
            {prefix}
          </span>
          <input
            type="tel"
            value={digits}
            onChange={handleDigitsChange}
            maxLength={isSyria ? 15 : selected.userDigits}
            inputMode={isSyria ? 'tel' : 'numeric'}
            className={`input-field !rounded-r-xl !rounded-l-none flex-1 ${error ? '!border-red-500/50 !ring-red-500/10' : ''}`}
          />
        </div>
      </div>
      {!error && !digits.length && selected.hint && <p className="text-gray-500 text-xs mt-1.5 pr-1">{selected.hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1.5 pr-1">{error}</p>}
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  function setFormValue(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateField(name, customValue) {
    const v = customValue !== undefined ? customValue : form[name];
    const errs = { ...errors };

    switch (name) {
      case 'fullName':
      case 'fatherName':
      case 'motherName':
        if (!v || !v.trim()) errs[name] = 'هذا الحقل مطلوب';
        else if (v.trim().length < 3) errs[name] = 'يجب أن يكون على الأقل 3 أحرف';
        else delete errs[name];
        break;
      case 'fatherStatus':
      case 'motherStatus':
        if (!v) errs[name] = 'يرجى اختيار الحالة';
        else delete errs[name];
        break;
      case 'fatherOccupation':
      case 'motherOccupation':
        if (!v || !v.trim()) errs[name] = 'هذا الحقل مطلوب';
        else delete errs[name];
        break;
      case 'fatherPhone':
      case 'motherPhone':
      case 'studentPhone': {
        if (name === 'studentPhone' && (!v || !v.trim())) {
          delete errs[name];
          break;
        }
        if (!v || !v.trim()) {
          errs[name] = 'هذا الحقل مطلوب';
          break;
        }
        const cCode = form[name === 'fatherPhone' ? 'fatherCountry' : name === 'motherPhone' ? 'motherCountry' : 'studentCountry'];
        const selected = COUNTRIES.find((c) => c.code === cCode) || COUNTRIES[0];
        const normalized = normalizePhone(v);
        if (!normalized) {
          errs[name] = 'رقم هاتف غير صحيح';
          break;
        }
        const local = cCode === 'SY' ? extractLocalDigits(normalized) : normalized;
        if (local.length !== selected.userDigits) {
          errs[name] = `يجب إدخال ${selected.userDigits} أرقام بالضبط`;
          break;
        }
        const fullNum = cCode === 'SY' ? normalized : buildFullPhone(cCode, normalized);
        try {
          if (isValidPhoneNumber(fullNum, cCode)) {
            delete errs[name];
          } else {
            errs[name] = 'رقم هاتف غير صحيح';
          }
        } catch {
          errs[name] = 'رقم هاتف غير صحيح';
        }
        break;
      }
      case 'birthYear':
        if (!v) errs[name] = 'يرجى اختيار سنة الميلاد';
        else delete errs[name];
        break;
      case 'stage':
        if (!v) errs[name] = 'يرجى اختيار المرحلة';
        else delete errs[name];
        break;
      default:
        delete errs[name];
    }

    setErrors(errs);
    return !errs[name];
  }

  function validateAll() {
    const fields = ['fullName', 'fatherName', 'motherName', 'fatherStatus', 'motherStatus',
      'fatherOccupation', 'motherOccupation', 'fatherPhone', 'motherPhone', 'birthYear', 'stage'];
    let valid = true;
    const newTouched = {};
    fields.forEach((f) => { newTouched[f] = true; });
    setTouched(newTouched);
    fields.forEach((f) => { if (!validateField(f)) valid = false; });

    const fatherP = form.fatherPhone;
    const motherP = form.motherPhone;
    const studentP = form.studentPhone;
    if ((!fatherP || !fatherP.trim()) && (!motherP || !motherP.trim()) && (!studentP || !studentP.trim())) {
      setErrors((prev) => ({ ...prev, _phone: 'يجب إدخال رقم تواصل واحد على الأقل (الأب، الأم، أو الطالب)' }));
      valid = false;
    } else {
      setErrors((prev) => { const { _phone, ...rest } = prev; return rest; });
    }

    if (!photo) {
      setErrors((prev) => ({ ...prev, photo: 'يرجى التقاط صورة للطالب' }));
      valid = false;
    }

    return valid;
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'studentCountry' || k === 'fatherCountry' || k === 'motherCountry') return;
        if (k === 'studentPhone') fd.append(k, buildFullPhone(form.studentCountry, v));
        else if (k === 'fatherPhone') fd.append(k, buildFullPhone(form.fatherCountry, v));
        else if (k === 'motherPhone') fd.append(k, buildFullPhone(form.motherCountry, v));
        else fd.append(k, v);
      });
      if (photo) fd.append('photo', photo);
      const res = await api.post('/auth/register', fd);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  function copyData() {
    const text = `اسم المستخدم: ${result.username}\nكلمة المرور: ${result.password}`;
    navigator.clipboard.writeText(text);
  }

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 20 }, (_, i) => currentYear - i - 5);

  if (result) {
    return (
      <div dir="rtl" className="min-h-screen app-bg p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <div className="card overflow-hidden border border-gold-500/10 shadow-2xl shadow-gold-500/10">
            <div className="bg-gradient-to-l from-[#141414] via-[#0f0f0f] to-[#0a0a0a] p-8 text-center border-b border-gold-500/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gradient-gold">تم التسجيل بنجاح</h2>
              <p className="text-gray-400 mt-2 text-sm">يرجى حفظ البيانات التالية:</p>
            </div>
            <div className="p-8">
              <div className="bg-[#141414]/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gold-500/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gold-500/8">
                    <span className="text-gray-400 text-sm">اسم المستخدم</span>
                    <span className="font-mono text-gold-400 font-bold text-lg tracking-wide" dir="ltr">{result.username}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 text-sm">كلمة المرور</span>
                    <span className="font-mono text-gold-400 font-bold text-lg tracking-wide" dir="ltr">{result.password}</span>
                  </div>
                </div>
              </div>
              <button onClick={copyData} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                نسخ البيانات
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary w-full">تسجيل الدخول</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen app-bg py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 right-20 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="card overflow-hidden border border-gold-500/10 shadow-2xl shadow-gold-500/10">
          <div className="bg-gradient-to-l from-[#141414] via-[#0f0f0f] to-[#0a0a0a] p-6 text-center border-b border-gold-500/10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 shadow-lg shadow-gold-500/30 flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-2xl bg-[#141414] flex items-center justify-center">
                <img src="/logo.png" alt="أكاديمية الخليل" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold">تسجيل طالب جديد</h1>
            <p className="text-gray-400 mt-1 text-sm">أكاديمية الخليل</p>
            <div className="w-12 h-0.5 bg-gradient-to-l from-gold-500/40 to-transparent mx-auto mt-3 rounded-full" />
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="alert-error mb-6">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  البيانات الشخصية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">الاسم والكنية <span className="text-red-400">*</span></label>
                    <input type="text" name="fullName" value={form.fullName} onChange={(e) => { setFormValue('fullName', e.target.value); if (touched.fullName) validateField('fullName', e.target.value); }} onBlur={() => handleBlur('fullName')} className={`input-field ${touched.fullName && errors.fullName ? '!border-red-500/50 !ring-red-500/10' : ''}`} placeholder="الاسم والكنية" />
                    {touched.fullName && errors.fullName && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="label-text">اسم الأب <span className="text-red-400">*</span></label>
                    <input type="text" name="fatherName" value={form.fatherName} onChange={(e) => { setFormValue('fatherName', e.target.value); if (touched.fatherName) validateField('fatherName', e.target.value); }} onBlur={() => handleBlur('fatherName')} className={`input-field ${touched.fatherName && errors.fatherName ? '!border-red-500/50 !ring-red-500/10' : ''}`} />
                    {touched.fatherName && errors.fatherName && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.fatherName}</p>}
                  </div>
                  <div>
                    <label className="label-text">اسم الأم <span className="text-red-400">*</span></label>
                    <input type="text" name="motherName" value={form.motherName} onChange={(e) => { setFormValue('motherName', e.target.value); if (touched.motherName) validateField('motherName', e.target.value); }} onBlur={() => handleBlur('motherName')} className={`input-field ${touched.motherName && errors.motherName ? '!border-red-500/50 !ring-red-500/10' : ''}`} />
                    {touched.motherName && errors.motherName && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.motherName}</p>}
                  </div>
                  <div>
                    <label className="label-text">سنة الميلاد <span className="text-red-400">*</span></label>
                    <SelectField
                      value={form.birthYear}
                      placeholder="اختر السنة"
                      onChange={(e) => { const v = e.target.value; setFormValue('birthYear', v); setTouched(p => ({...p, birthYear: true})); validateField('birthYear', v); }}
                      name="birthYear"
                      error={touched.birthYear && errors.birthYear}
                      options={birthYears.map((y) => ({ value: String(y), label: String(y) }))}
                    />
                    {touched.birthYear && errors.birthYear && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.birthYear}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gold-500/10 pt-5">
                <h3 className="text-sm font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  معلومات والدي الطالب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">حالة الأب <span className="text-red-400">*</span></label>
                    <SelectField
                      value={form.fatherStatus}
                      placeholder="-- اختر --"
                      onChange={(e) => { const v = e.target.value; setFormValue('fatherStatus', v); setTouched(p => ({...p, fatherStatus: true})); validateField('fatherStatus', v); }}
                      name="fatherStatus"
                      error={touched.fatherStatus && errors.fatherStatus}
                      options={STATUS_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
                    />
                    {touched.fatherStatus && errors.fatherStatus && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.fatherStatus}</p>}
                  </div>
                  <div>
                    <label className="label-text">حالة الأم <span className="text-red-400">*</span></label>
                    <SelectField
                      value={form.motherStatus}
                      placeholder="-- اختر --"
                      onChange={(e) => { const v = e.target.value; setFormValue('motherStatus', v); setTouched(p => ({...p, motherStatus: true})); validateField('motherStatus', v); }}
                      name="motherStatus"
                      error={touched.motherStatus && errors.motherStatus}
                      options={STATUS_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
                    />
                    {touched.motherStatus && errors.motherStatus && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.motherStatus}</p>}
                  </div>
                  <div>
                    <label className="label-text">مهنة الأب <span className="text-red-400">*</span></label>
                    <input type="text" name="fatherOccupation" value={form.fatherOccupation} onChange={(e) => { setFormValue('fatherOccupation', e.target.value); if (touched.fatherOccupation) validateField('fatherOccupation', e.target.value); }} onBlur={() => handleBlur('fatherOccupation')} className={`input-field ${touched.fatherOccupation && errors.fatherOccupation ? '!border-red-500/50 !ring-red-500/10' : ''}`} />
                    {touched.fatherOccupation && errors.fatherOccupation && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.fatherOccupation}</p>}
                  </div>
                  <div>
                    <label className="label-text">مهنة الأم <span className="text-red-400">*</span></label>
                    <input type="text" name="motherOccupation" value={form.motherOccupation} onChange={(e) => { setFormValue('motherOccupation', e.target.value); if (touched.motherOccupation) validateField('motherOccupation', e.target.value); }} onBlur={() => handleBlur('motherOccupation')} className={`input-field ${touched.motherOccupation && errors.motherOccupation ? '!border-red-500/50 !ring-red-500/10' : ''}`} />
                    {touched.motherOccupation && errors.motherOccupation && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.motherOccupation}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gold-500/10 pt-5">
                <h3 className="text-sm font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  معلومات التواصل
                </h3>
                <div className="space-y-4">
                  <CountryPhoneRow label="رقم الطالب" required={false} country={form.studentCountry} digits={form.studentPhone} onCountryChange={(v) => setFormValue('studentCountry', v)} onDigitsChange={(v) => { setFormValue('studentPhone', v); setTouched(p => ({...p, studentPhone: true})); validateField('studentPhone', v); }} error={touched.studentPhone ? errors.studentPhone : ''} showOptional />
                  <CountryPhoneRow label="رقم الأب" required country={form.fatherCountry} digits={form.fatherPhone} onCountryChange={(v) => setFormValue('fatherCountry', v)} onDigitsChange={(v) => { setFormValue('fatherPhone', v); setTouched(p => ({...p, fatherPhone: true})); validateField('fatherPhone', v); }} error={touched.fatherPhone ? errors.fatherPhone : ''} />
                  <CountryPhoneRow label="رقم الأم" required country={form.motherCountry} digits={form.motherPhone} onCountryChange={(v) => setFormValue('motherCountry', v)} onDigitsChange={(v) => { setFormValue('motherPhone', v); setTouched(p => ({...p, motherPhone: true})); validateField('motherPhone', v); }} error={touched.motherPhone ? errors.motherPhone : ''} />
                  {errors._phone && <p className="text-red-400 text-xs pr-1">{errors._phone}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">رقم التواصل عبر واتساب <span className="text-red-400">*</span></label>
                      <SelectField
                        value={form.primaryContact}
                        onChange={(e) => setFormValue('primaryContact', e.target.value)}
                        name="primaryContact"
                        options={[
                          { value: 'father', label: 'رقم الأب' },
                          { value: 'mother', label: 'رقم الأم' },
                          { value: 'student', label: 'رقم الطالب' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="label-text">المرحلة الدراسية <span className="text-red-400">*</span></label>
                      <SelectField
                        value={form.stage}
                        placeholder="اختر المرحلة"
                        onChange={(e) => { const v = e.target.value; setFormValue('stage', v); setTouched(p => ({...p, stage: true})); validateField('stage', v); }}
                        name="stage"
                        error={touched.stage && errors.stage}
                        options={STAGES.map((s) => ({ value: s, label: s }))}
                      />
                      {touched.stage && errors.stage && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.stage}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gold-500/10 pt-5">
                <h3 className="text-sm font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  صورة الطالب
                </h3>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-gold-500/30 w-48 h-48 mx-auto">
                    <img src={photoPreview} alt="الطالب" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowCamera(true)} className="group w-full h-44 border-2 border-dashed border-gray-700/30 rounded-2xl hover:border-gold-500/50 transition-all duration-300 bg-[#0a0a0a]/30 hover:bg-[#141414]/50 flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-[#141414]/80 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors mb-3">
                      <svg className="w-7 h-7 text-gray-500 group-hover:text-gold-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-gold-400 transition-colors">اضغط لفتح الكاميرا والتقاط صورة</p>
                    <p className="text-xs text-gray-600 mt-1">سيتم استخدام الكاميرا الأمامية افتراضياً</p>
                  </button>
                )}
                {errors.photo && <p className="text-red-400 text-xs mt-1.5 pr-1">{errors.photo}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base min-h-[48px]">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>جاري التسجيل...</span>
                  </>
                ) : 'تسجيل الطالب'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => navigate('/login')} className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium">العودة إلى تسجيل الدخول</button>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
