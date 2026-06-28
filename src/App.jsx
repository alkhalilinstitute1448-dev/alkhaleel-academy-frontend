import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBatches from './pages/admin/AdminBatches';
import AdminExams from './pages/admin/AdminExams';
import AdminCurriculum from './pages/admin/AdminCurriculum';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherExams from './pages/teacher/TeacherExams';
import AttendancePanel from './pages/attendance/AttendancePanel';
import StudentDashboard from './pages/student/StudentDashboard';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="app-bg h-screen flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,149,44,0.06),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/20 flex items-center justify-center">
            <img src="/logo.png" alt="أكاديمية الخليل" className="w-12 h-12 object-contain" />
          </div>
          <div className="absolute -inset-1 rounded-full border border-gold-500/20 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
        </div>
        <p className="mt-6 text-gold-400 text-lg font-bold tracking-wide">أكاديمية الخليل</p>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gold-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-arabic bg-[#0a0a0a]">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-registration" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/batches" element={<ProtectedRoute roles={['admin']}><AdminBatches /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute roles={['admin', 'teacher']}><AdminExams /></ProtectedRoute>} />
        <Route path="/admin/curriculum" element={<ProtectedRoute roles={['admin']}><AdminCurriculum /></ProtectedRoute>} />

        <Route path="/teacher/grades" element={<ProtectedRoute roles={['teacher']}><TeacherGrades /></ProtectedRoute>} />
        <Route path="/teacher/exams" element={<ProtectedRoute roles={['teacher']}><TeacherExams /></ProtectedRoute>} />

        <Route path="/attendance" element={<ProtectedRoute roles={['attendance_officer', 'admin']}><AttendancePanel /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={
          <div className="app-bg min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold text-gold-500/30">404</p>
              <p className="text-gray-400 mt-4">الصفحة غير موجودة</p>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}
