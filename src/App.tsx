
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
import Meminverso from "./pages/Meminverso";
import ProtectedRoute from "./components/ProtectedRoute";
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
            path="/meminverso" 
            element={
              <ProtectedRoute>
                <Meminverso />
              </ProtectedRoute>
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
