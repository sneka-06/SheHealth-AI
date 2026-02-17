import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import PCOSPage from "./pages/PCOSPage";
import AnemiaPage from "./pages/AnemiaPage";
import ThyroidPage from "./pages/ThyroidPage";
import OsteoporosisPage from "./pages/OsteoporosisPage";
import BreastCancerPage from "./pages/BreastCancerPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pcos" element={<PCOSPage />} />
          <Route path="/anemia" element={<AnemiaPage />} />
          <Route path="/thyroid" element={<ThyroidPage />} />
          <Route path="/osteoporosis" element={<OsteoporosisPage />} />
          <Route path="/breast-cancer" element={<BreastCancerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
