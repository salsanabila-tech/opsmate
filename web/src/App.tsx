import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/protected-route';

import { AdminLayout } from './layouts/admin-layout';

import { DashboardPage } from './pages/dashboard-page';

import { LoginPage } from './pages/login-page';

import { WorkOrdersPage } from './pages/work-orders-page';

import { WorkOrderDetailPage } from './pages/work-order-detail-page';

import { CreateWorkOrderPage } from './pages/create-work-order-page';

import { PlaceholderPage } from './pages/placeholder-page';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="work-orders" element={<WorkOrdersPage />} />

          <Route path="work-orders/new" element={<CreateWorkOrderPage />} />

          <Route path="work-orders/:workOrderId" element={<WorkOrderDetailPage />} />

          <Route path="customers" element={<PlaceholderPage title="Customers" description="Kelola data customer OpsMate." />} />

          <Route path="technicians" element={<PlaceholderPage title="Technicians" description="Kelola akun dan aktivitas teknisi." />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
