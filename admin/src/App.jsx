import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ManageMotoHome from './pages/ManageMotoHome.jsx';
import CompanyLogin from './pages/CompanyLogin.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import CompanyBranches from './pages/CompanyBranches.jsx';
import PlatformAdminLogin from './pages/PlatformAdminLogin.jsx';
import PlatformDashboard from './pages/PlatformDashboard.jsx';
import PlatformCompanies from './pages/PlatformCompanies.jsx';
import PlatformCompanyCreate from './pages/PlatformCompanyCreate.jsx';
import PlatformCompanyDetail from './pages/PlatformCompanyDetail.jsx';
import Landing from './pages/Landing.jsx';
import BranchLogin from './pages/BranchLogin.jsx';
import SuperAdminLogin from './pages/SuperAdminLogin.jsx';
import InventoryList from './pages/InventoryList.jsx';
import InventoryForm from './pages/InventoryForm.jsx';
import BulkVehicleForm from './pages/BulkVehicleForm.jsx';
import InventoryDetail from './pages/InventoryDetail.jsx';
import StockPage from './pages/StockPage.jsx';
import VendorsList from './pages/VendorsList.jsx';
import VendorDetail from './pages/VendorDetail.jsx';
import CustomersList from './pages/CustomersList.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import LedgerPage from './pages/LedgerPage.jsx';
import SalesList from './pages/SalesList.jsx';
import NewSaleWizard from './pages/NewSaleWizard.jsx';
import SaleDetail from './pages/SaleDetail.jsx';
import RecoveryDashboard from './pages/RecoveryDashboard.jsx';
import ReturnsList from './pages/ReturnsList.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import CashbookPage from './pages/CashbookPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  useEffect(() => {
    document.title = 'ManageMoto';
  }, []);

  useEffect(() => {
    function blockNumberArrowKeys(e) {
      if (
        (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
        e.target instanceof HTMLInputElement &&
        e.target.type === 'number'
      ) {
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', blockNumberArrowKeys);
    return () => window.removeEventListener('keydown', blockNumberArrowKeys);
  }, []);

  useEffect(() => {
    function blurNumberOnWheel(e) {
      if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
        e.target.blur();
      }
    }

    window.addEventListener('wheel', blurNumberOnWheel, { passive: true });
    return () => window.removeEventListener('wheel', blurNumberOnWheel);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManageMotoHome />} />
        <Route path="/company-login" element={<CompanyLogin />} />

        <Route path="/platform-admin/login" element={<PlatformAdminLogin />} />
        <Route path="/platform-admin" element={<PlatformDashboard />} />
        <Route path="/platform-admin/companies" element={<PlatformCompanies />} />
        <Route path="/platform-admin/companies/new" element={<PlatformCompanyCreate />} />
        <Route path="/platform-admin/companies/:id" element={<PlatformCompanyDetail />} />

        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/branches" element={<CompanyBranches />} />

        {/* Backward-compatible company owner landing */}
        <Route path="/dashboard" element={<CompanyDashboard />} />

        <Route path="/pos" element={<Landing />} />
        <Route path="/login/:branchId" element={<BranchLogin />} />
        <Route path="/admin-login" element={<SuperAdminLogin />} />

        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/new" element={<InventoryForm />} />
        <Route path="/inventory/bulk-vehicles" element={<BulkVehicleForm />} />
        <Route path="/inventory/:id" element={<InventoryDetail />} />
        <Route path="/inventory/:id/edit" element={<InventoryForm />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/vendors" element={<VendorsList />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/:id" element={<CustomerProfile />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/sales" element={<SalesList />} />
        <Route path="/sales/new" element={<NewSaleWizard />} />
        <Route path="/sales/:id" element={<SaleDetail />} />
        <Route path="/recovery" element={<RecoveryDashboard />} />
        <Route path="/returns" element={<ReturnsList />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/cashbook" element={<CashbookPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
