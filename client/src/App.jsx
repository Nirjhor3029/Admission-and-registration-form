import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/public/Landing';
import RegistrationStep1 from './pages/public/RegistrationStep1';
import RegistrationStep2 from './pages/public/RegistrationStep2';
import Confirmation from './pages/public/Confirmation';

import AdminLogin from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import Overview from './pages/admin/Overview';
import StudentManagement from './pages/admin/StudentManagement';
import PaymentVerification from './pages/admin/PaymentVerification';
import CourseManagement from './pages/admin/CourseManagement';
import Reports from './pages/admin/Reports';

import StudentDashboard from './pages/student/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register/step1" element={<RegistrationStep1 />} />
          <Route path="/register/step2" element={<RegistrationStep2 />} />
          <Route path="/register/confirmed" element={<Confirmation />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role={['super_admin', 'admission_officer', 'accountant']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="payments" element={<PaymentVerification />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
