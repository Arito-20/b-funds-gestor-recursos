import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout/AppLayout';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ResourcesPage from './pages/ResourcesPage/ResourcesPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage/PurchaseOrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
