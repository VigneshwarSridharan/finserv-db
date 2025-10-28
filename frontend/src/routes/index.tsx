import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import { Box, Spinner } from '@chakra-ui/react';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';

// Lazy load pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const SecuritiesPage = lazy(() => import('../features/securities/SecuritiesPage'));
const BrokersPage = lazy(() => import('../features/securities/BrokersPage'));
const BrokerAccountsPage = lazy(() => import('../features/securities/BrokerAccountsPage'));
const HoldingsPage = lazy(() => import('../features/securities/HoldingsPage'));
const TransactionsPage = lazy(() => import('../features/securities/TransactionsPage'));
const BankingPage = lazy(() => import('../features/banking/BankingPage'));
const BankAccountsPage = lazy(() => import('../features/banking/BankAccountsPage'));
const FixedDepositsPage = lazy(() => import('../features/banking/FixedDepositsPage'));
const RecurringDepositsPage = lazy(() => import('../features/banking/RecurringDepositsPage'));
const AssetsPage = lazy(() => import('../features/assets/AssetsPage'));
const AssetsListPage = lazy(() => import('../features/assets/AssetsListPage'));
const CategoriesPage = lazy(() => import('../features/assets/CategoriesPage'));
const RealEstatePage = lazy(() => import('../features/assets/RealEstatePage'));
const GoldPage = lazy(() => import('../features/assets/GoldPage'));
const PortfolioPage = lazy(() => import('../features/portfolio/PortfolioPage'));
const GoalsPage = lazy(() => import('../features/portfolio/GoalsPage'));
const AlertsPage = lazy(() => import('../features/portfolio/AlertsPage'));
const WatchlistPage = lazy(() => import('../features/portfolio/WatchlistPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const AppLayout = lazy(() => import('../components/layout/AppLayout'));

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minH="100vh"
  >
    <Spinner size="xl" color="brand.500" />
  </Box>
);

// Route element wrapper with error boundary
const RouteElement = ({ children }: { children: React.ReactNode }) => (
  <RouteErrorBoundary>
    {children}
  </RouteErrorBoundary>
);

// Private Route wrapper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route wrapper (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <RouteElement>
                <LoginPage />
              </RouteElement>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RouteElement>
                <RegisterPage />
              </RouteElement>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RouteElement><DashboardPage /></RouteElement>} />
          <Route path="securities" element={<RouteElement><SecuritiesPage /></RouteElement>} />
          <Route path="securities/brokers" element={<RouteElement><BrokersPage /></RouteElement>} />
          <Route path="securities/accounts" element={<RouteElement><BrokerAccountsPage /></RouteElement>} />
          <Route path="securities/holdings" element={<RouteElement><HoldingsPage /></RouteElement>} />
          <Route path="securities/transactions" element={<RouteElement><TransactionsPage /></RouteElement>} />
          <Route path="banking" element={<RouteElement><BankingPage /></RouteElement>} />
          <Route path="banking/accounts" element={<RouteElement><BankAccountsPage /></RouteElement>} />
          <Route path="banking/fixed-deposits" element={<RouteElement><FixedDepositsPage /></RouteElement>} />
          <Route path="banking/recurring-deposits" element={<RouteElement><RecurringDepositsPage /></RouteElement>} />
          <Route path="assets" element={<RouteElement><AssetsPage /></RouteElement>} />
          <Route path="assets/list" element={<RouteElement><AssetsListPage /></RouteElement>} />
          <Route path="assets/categories" element={<RouteElement><CategoriesPage /></RouteElement>} />
          <Route path="assets/real-estate" element={<RouteElement><RealEstatePage /></RouteElement>} />
          <Route path="assets/gold" element={<RouteElement><GoldPage /></RouteElement>} />
          <Route path="portfolio" element={<RouteElement><PortfolioPage /></RouteElement>} />
          <Route path="portfolio/goals" element={<RouteElement><GoalsPage /></RouteElement>} />
          <Route path="portfolio/alerts" element={<RouteElement><AlertsPage /></RouteElement>} />
          <Route path="portfolio/watchlist" element={<RouteElement><WatchlistPage /></RouteElement>} />
          <Route path="profile" element={<RouteElement><ProfilePage /></RouteElement>} />
          <Route path="settings" element={<RouteElement><ProfilePage /></RouteElement>} />
          
          {/* 404 for authenticated users */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 for unauthenticated users */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;


