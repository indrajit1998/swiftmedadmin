import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DriverHistory from './pages/DriverHistory';
import DriverManagement from './pages/DriverManagement';
import DriverPayments from './pages/DriverPayments';
import DriverWallet from './pages/DriverWallet';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import ReferralDriverSide from './pages/ReferralDriverSide';
import Support from './pages/Support';
import TravelManagement from './pages/TravelManagement';
import UserManagement from './pages/UserManagement';
import UserPayments from './pages/UserPayments';
import UserReferralSide from './pages/UserReferralSide';
import UserWallet from './pages/UserWallet';
import UserWalletHistory from './pages/UserWalletHistoty';
import DriverPaymentHistory from './pages/DriverPaymentHistory';
import AmbulanceManagement from './pages/AmbulanceManagement';
import PricingConfig from './pages/PricingConfig';
import AddOnManagement from './pages/AddOnManagement';
import ZoneManagement from './pages/ZoneManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            {/* Management */}
            <Route path="users" element={<UserManagement />} />
            <Route path="drivers" element={<DriverManagement />} />
            <Route path="ambulance-types" element={<AmbulanceManagement />} />
            <Route path="pricing-config" element={<PricingConfig />} />
            <Route path="addons" element={<AddOnManagement />} />
            <Route path="zones" element={<ZoneManagement />} />

            {/* Payments */}
            <Route path="payments/users" element={<UserPayments />} />
            <Route path="payments/drivers" element={<DriverPayments />} />
            <Route path="/payments/drivers/history" element={<DriverPaymentHistory />} />
            <Route path="payments/drivers/history" element={<DriverHistory />} />

            {/* Wallet */}
            <Route path="wallet/drivers" element={<DriverWallet />} />
            <Route path="wallet/users" element={<UserWallet />} />
            <Route path="wallet/users/:userId/history" element={<UserWalletHistory />} />

            {/* Referral */}
            <Route path="referral-user" element={<UserReferralSide />} />
            <Route path="referral-driver" element={<ReferralDriverSide />} />

            {/* Others */}
            <Route path="support" element={<Support />} />
            <Route path="travels" element={<TravelManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
