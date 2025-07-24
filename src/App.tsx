
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import VaucherPago from "./pages/VaucherPago";
import Requests from "./pages/Requests";
import Organizacion from "./pages/Organizacion";
import Refes from "./pages/Refes";
import Meminverso from "./pages/Meminverso";
import Material from "./pages/Material";
import UserAdmin from "./pages/UserAdmin";
import Compras from "./pages/Compras";
import News from "./pages/News";
import SponsorChange from "./pages/SponsorChange";
import LinkConferencias from "./pages/LinkConferencias";
import ComTipo from "./pages/ComTipo";
import Pagos from "./pages/Pagos";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Ruta pública - login (no puede acceder si ya está autenticado) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Index />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas públicas - signup (siempre accesibles) */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/:username" element={<Signup />} />
          
          {/* Rutas protegidas - requieren autenticación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vaucher_pago" 
            element={
              <ProtectedRoute>
                <VaucherPago />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/requests" 
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/organizacion" 
            element={
              <ProtectedRoute>
                <Organizacion />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/refes" 
            element={
              <ProtectedRoute>
                <Refes />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/meminverso" 
            element={
              <ProtectedRoute>
                <Meminverso />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/material" 
            element={
              <ProtectedRoute>
                <Material />
              </ProtectedRoute>
            } 
          />

          {/* Rutas administrativas - solo para admin (id = 1) */}
          <Route 
            path="/compras" 
            element={
              <AdminRoute>
                <Compras />
              </AdminRoute>
            } 
          />

          <Route 
            path="/userad" 
            element={
              <AdminRoute>
                <UserAdmin />
              </AdminRoute>
            } 
          />

          <Route 
            path="/news" 
            element={
              <AdminRoute>
                <News />
              </AdminRoute>
            } 
          />

          <Route 
            path="/sponsor-change" 
            element={
              <AdminRoute>
                <SponsorChange />
              </AdminRoute>
            } 
          />

          <Route 
            path="/linkconf" 
            element={
              <AdminRoute>
                <LinkConferencias />
              </AdminRoute>
            } 
          />

          <Route 
            path="/comtipo" 
            element={
              <AdminRoute>
                <ComTipo />
              </AdminRoute>
            } 
          />

          <Route 
            path="/pagos" 
            element={
              <AdminRoute>
                <Pagos />
              </AdminRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
