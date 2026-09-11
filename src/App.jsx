import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from '@/lib/AuthContext';
import { AppProvider } from '@/lib/AppContext';
import Layout from '@/components/Layout';
// Add page imports here
import Home from '@/pages/Home';
import MyProjects from '@/pages/MyProjects';
import PresentationBuilder from '@/pages/PresentationBuilder';
import PosterMaker from '@/pages/PosterMaker';
import ReportAssignment from '@/pages/ReportAssignment';
import SettingsPage from '@/pages/Settings';
import About from '@/pages/About';
import Examples from '@/pages/Examples';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/examples" element={<Examples />} />
                <Route path="/projects" element={<MyProjects />} />
                <Route path="/presentation-builder" element={<PresentationBuilder />} />
                <Route path="/poster-maker" element={<PosterMaker />} />
                <Route path="/report-assignment" element={<ReportAssignment />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<About />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
        </AppProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App