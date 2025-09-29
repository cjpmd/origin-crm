import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Index from "./pages/Index";
import Pipeline from "./pages/Pipeline";
import Contacts from "./pages/Contacts";
import Portfolio from "./pages/Portfolio";
import Companies from "./pages/Companies";
import Investors from "./pages/Investors";
import ESGAnalytics from "./pages/ESGAnalytics";
import SectoralAnalysis from "./pages/SectoralAnalysis";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="companies" element={<Companies />} />
            <Route path="investors" element={<Investors />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="esg-analytics" element={<ESGAnalytics />} />
            <Route path="sectoral-analysis" element={<SectoralAnalysis />} />
            <Route path="sectoral-analysis/:sectorId" element={<SectoralAnalysis />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
