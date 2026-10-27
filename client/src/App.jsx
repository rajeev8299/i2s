import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected App Pages
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ClientsPage } from './pages/ClientsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { FinancePage } from './pages/FinancePage';
import { HRPage } from './pages/HRPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DailyWorkPage } from './pages/DailyWorkPage';
import { TeamReportsPage } from './pages/TeamReportsPage';
import { ClientProgressPage } from './pages/ClientProgressPage';
import { ClientServicesPage } from './pages/ClientServicesPage';
import { AdminServicesPage } from './pages/AdminServicesPage';
import { NoticesPage } from './pages/NoticesPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Application Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="daily-work" element={<DailyWorkPage />} />

              {/* Team Work Review & Approvals */}
              <Route
                path="team-reports"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER']} />
                }
              >
                <Route index element={<TeamReportsPage />} />
              </Route>

              {/* Client Daily Progress Timeline Portal */}
              <Route
                path="client-progress"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CLIENT', 'TEAM_LEADER']} />
                }
              >
                <Route index element={<ClientProgressPage />} />
              </Route>

              {/* Client Service Catalog & Online Checkout */}
              <Route
                path="client/services"
                element={
                  <ProtectedRoute allowedRoles={['CLIENT', 'SUPER_ADMIN', 'ADMIN']} />
                }
              >
                <Route index element={<ClientServicesPage />} />
              </Route>

              {/* Admin Service Management & Quotation Issuance */}
              <Route
                path="admin/services"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />
                }
              >
                <Route index element={<AdminServicesPage />} />
              </Route>

              {/* Service alias */}
              <Route
                path="services"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CLIENT']} />
                }
              >
                <Route index element={<AdminServicesPage />} />
              </Route>

              {/* HR / Personnel Routes */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']} />
                }
              >
                <Route index element={<UsersPage />} />
              </Route>

              {/* Client Management */}
              <Route
                path="clients"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER']} />
                }
              >
                <Route index element={<ClientsPage />} />
              </Route>

              {/* Finance & Invoicing with separate sub-routes */}
              <Route
                path="finance"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER', 'CLIENT']} />
                }
              >
                <Route index element={<FinancePage />} />
                <Route path="invoices" element={<FinancePage />} />
                <Route path="payments" element={<FinancePage />} />
                <Route path="ledger" element={<FinancePage />} />
                <Route path="trial-balance" element={<FinancePage />} />
              </Route>

              {/* HR, Attendance & Payroll with separate sub-routes (all 7 employee roles, CLIENT excluded) */}
              <Route
                path="hr"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'ACCOUNTS_MANAGER', 'TEAM_LEADER', 'STAFF', 'INTERN']} />
                }
              >
                <Route index element={<HRPage />} />
                <Route path="employees" element={<Navigate to="/app/users" replace />} />
                <Route path="attendance" element={<HRPage />} />
                <Route path="leave" element={<HRPage />} />
                <Route path="payroll" element={<HRPage />} />
              </Route>

              {/* Messages & Official Notices (All 7 Roles, CLIENT Strictly Excluded) */}
              <Route
                path="notices"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'ACCOUNTS_MANAGER', 'TEAM_LEADER', 'STAFF', 'INTERN']} />
                }
              >
                <Route index element={<NoticesPage />} />
              </Route>

              {/* Reports & Analytics */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER', 'HR_MANAGER', 'TEAM_LEADER']} />
                }
              >
                <Route index element={<ReportsPage />} />
              </Route>

              {/* Super Admin Settings */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']} />
                }
              >
                <Route index element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
