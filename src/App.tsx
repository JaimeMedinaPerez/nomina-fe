import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { WorkerAttendance } from './pages/worker/WorkerAttendance'
import { WorkerPermissions } from './pages/worker/WorkerPermissions'

import { WorkerPayments } from './pages/worker/WorkerPayments'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminEmployees } from './pages/admin/AdminEmployees'
import { AdminAttendance } from './pages/admin/AdminAttendance'
import { AdminPermissions } from './pages/admin/AdminPermissions'
import { AdminPayroll } from './pages/admin/AdminPayroll'
import { AdminDocuments } from './pages/admin/AdminDocuments'
import { WorkerDocuments } from './pages/worker/WorkerDocuments'
import { DebugPage } from './pages/DebugPage'
import { WorkerDashboard } from './pages/worker/WorkerDashboard'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/debug" element={<DebugPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="payroll" element={<AdminPayroll />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="documents" element={<AdminDocuments />} />
        </Route>

        {/* Worker Routes */}
        <Route path="/worker" element={
          <ProtectedRoute allowedRoles={['worker']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<WorkerDashboard />} />
          <Route path="attendance" element={<WorkerAttendance />} />
          <Route path="payments" element={<WorkerPayments />} />
          <Route path="permissions" element={<WorkerPermissions />} />
          <Route path="documents" element={<WorkerDocuments />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
