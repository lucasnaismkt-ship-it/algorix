import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import Operations from "./pages/Operations";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Wallet from "./pages/Wallet";
import Support from "./pages/Support";
import Network from "./pages/Network";
import AdminNetwork from "./pages/AdminNetwork";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RiskManagement from "./pages/RiskManagement";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { useStore } from "./lib/store";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { fetchProfile, fetchOperations, currentUser } = useStore();
  
  useEffect(() => {
    if (user && !currentUser) {
      fetchProfile(user.id);
      fetchOperations(user.id);
    }
  }, [user, currentUser, fetchProfile, fetchOperations]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { currentUser } = useStore();

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Carregando...</div>;
  if (!user || currentUser?.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

const AppContent = () => {
  // Simulação automática removida para garantir integridade dos dados do banco
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/gestao-de-risco" element={<RiskManagement />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/operations" element={
          <ProtectedRoute>
            <Operations />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/network" element={
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminWithdrawals />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/network" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminNetwork />
            </AdminRoute>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  const { fetchConversionRate } = useStore();

  useEffect(() => {
    document.body.classList.add('dark');
    fetchConversionRate();
    // Refresh rate every 10 minutes
    const interval = setInterval(fetchConversionRate, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;