import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AITutor from "./pages/AITutor";
import ARLearning from "./pages/ARLearning";
import MindPulse from "./pages/MindPulse";
import Talk2Code from "./pages/Talk2Code";
import LearnFlow from "./pages/LearnFlow";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/ar-learning" element={<ARLearning />} />
            <Route path="/mindpulse" element={<MindPulse />} />
            <Route path="/talk2code" element={<Talk2Code />} />
            <Route path="/learnflow" element={<LearnFlow />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
