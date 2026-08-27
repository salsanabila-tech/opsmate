import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/protected-route';

import { AdminLayout } from './layouts/admin-layout';

import { DashboardPage } from './pages/dashboard-page';

import { LoginPage } from './pages/login-page';

import { WorkOrdersPage } from './pages/work-orders-page';

import { WorkOrderDetailPage } from './pages/work-order-detail-page';

import { CreateWorkOrderPage } from './pages/create-work-order-page';

import { CustomersPage } from './pages/customer-page';

import { CreateCustomerPage } from './pages/create-customer-page';

import { CustomerDetailPage } from './pages/customer-detail-page';

import { EditCustomerPage } from './pages/edit-customer-page';

import { TechniciansPage } from './pages/technician-page';

import { CreateTechnicianPage } from './pages/create-technician-page';

import { TechnicianDetailPage } from './pages/technician-detail-page';

import { EditTechnicianPage } from './pages/edit-technician-page';

import { ServiceRequestsPage } from './pages/service-request-page';

import { ServiceRequestDetailPage } from './pages/service-request-detail-page';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="service-requests" element={<ServiceRequestsPage />} />

          <Route path="service-requests/:serviceRequestId" element={<ServiceRequestDetailPage />} />

          <Route path="work-orders" element={<WorkOrdersPage />} />

          <Route path="work-orders/new" element={<CreateWorkOrderPage />} />

          <Route path="work-orders/:workOrderId" element={<WorkOrderDetailPage />} />

          <Route path="customers" element={<CustomersPage />} />

          <Route path="customers/new" element={<CreateCustomerPage />} />

          <Route path="customers/:customerId" element={<CustomerDetailPage />} />

          <Route path="customers/:customerId/edit" element={<EditCustomerPage />} />

          <Route path="technicians" element={<TechniciansPage />} />

          <Route path="technicians/new" element={<CreateTechnicianPage />} />

          <Route path="technicians/:technicianId" element={<TechnicianDetailPage />} />

          <Route path="technicians/:technicianId/edit" element={<EditTechnicianPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
