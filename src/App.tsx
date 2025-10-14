import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ResearchNotifications } from "@/components/Research/ResearchNotifications";
import AppLayout from "./components/Layout/AppLayout";
import { GlobalSearch } from "@/components/Search/GlobalSearch";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Pipeline from "./pages/Pipeline";
import Contacts from "./pages/Contacts";
import Portfolio from "./pages/Portfolio";
import Funds from "./pages/Funds";
import Companies from "./pages/Companies";
import Investors from "./pages/Investors";
import InvestorPipeline from "./pages/InvestorPipeline";
import FundraisingDashboard from "./pages/FundraisingDashboard";
import ESGAnalytics from "./pages/ESGAnalytics";
import SectoralAnalysis from "./pages/SectoralAnalysis";
import Research from "./pages/Research";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Intermediaries from "./pages/Intermediaries";
import News from "./pages/News";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ResearchNotifications />
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Index />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="funds" element={<Funds />} />
            <Route path="companies" element={<Companies />} />
            <Route path="investors" element={<Investors />} />
            <Route path="investor-pipeline" element={<InvestorPipeline />} />
            <Route path="fundraising" element={<FundraisingDashboard />} />
            <Route path="portfolio" element={<Portfolio />} />
            {/* Redirect old routes to Analytics page */}
            <Route path="esg-analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="sectoral-analysis" element={<Navigate to="/analytics" replace />} />
            <Route path="sectoral-analysis/:sectorId" element={<SectoralAnalysis />} />
            <Route path="research/company/:companyId" element={<Research />} />
            <Route path="research/sector/:sectorId" element={<Research />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="intermediaries" element={<Intermediaries />} />
            <Route path="news" element={<News />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="team" element={<Team />} />
            <Route path="journal" element={<Journal />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
