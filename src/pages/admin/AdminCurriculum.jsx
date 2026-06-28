import { useState, useEffect } from 'react';
import api from '../../api';
import SelectField from '../../components/SelectField';

export default function AdminCurriculum() {
  const [files, setFiles] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [stageId, setStageId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/curriculum'),
      api.get('/stages'),
    ]).then(([fRes, sRes]) => {
      setFiles(fRes.data);
      setStages(sRes.data);
    }).catch(() => setError('فشل تحميل البيانات'))
    .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('stageId', stageId);
      formData.append('file', file);
      const res = await api.post('/curriculum', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles((prev) => [...prev, res.data]);
      setTitle('');
      setStageId('');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    try {
      await api.delete(`/curriculum/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError('فشل حذف الملف');
    }
  };

  const downloadFile = (fileItem) => {
    window.open(`/api/curriculum/${fileItem.id}/download`, '_blank');
  };

  return (
    <div dir="rtl" className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="page-header">إدارة المنهاج</h1>

        {error && <div className="alert-error mb-6"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}

        <div className="card mb-8 border-gold-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">رفع ملف جديد</h3>
          </div>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label-text">عنوان الملف</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-text">المرحلة</label>
              <SelectField
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder="اختر المرحلة"
              />
            </div>
            <div>
              <label className="label-text">الملف (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-br file:from-gold-500 file:to-gold-600 file:text-black file:font-medium file:cursor-pointer hover:file:shadow-lg transition-all" required />
            </div>
            <div className="md:col-span-3">
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? (
                  <span className="flex items-center gap-2"><div className="spinner" />جاري الرفع...</span>
                ) : 'رفع الملف'}
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-500/8 flex items-center gap-3">
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-bold text-white">الملفات المرفوعة</h3>
            </div>
            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">لا توجد ملفات مرفوعة</div>
            ) : (
              <div className="divide-y divide-gold-500/8">
                {files.map((f) => {
                  const stage = stages.find((s) => s.id === f.stageId);
                  return (
                    <div key={f.id} className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gold-500/5 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm sm:text-base truncate">{f.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            <span className="badge-gold !text-xs !px-2 !py-0.5 ml-1">{stage?.name || '—'}</span>
                            {f.fileName || f.file_path?.split('/').pop()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                        <button onClick={() => downloadFile(f)} className="btn-ghost !px-3 !py-1.5 !text-xs text-gold-400 hover:bg-gold-500/5">تحميل</button>
                        <button onClick={() => deleteFile(f.id)} className="btn-ghost !px-3 !py-1.5 !text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
