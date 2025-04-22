import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NetlifyDemo from "@/pages/NetlifyDemo";
import QuestionDetail from "@/pages/QuestionDetail";
import TanyaPertanyaanBaru from "@/pages/TanyaPertanyaanBaru";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/netlify-demo" element={<NetlifyDemo />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/tanya-pertanyaan-baru" element={<TanyaPertanyaanBaru />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
