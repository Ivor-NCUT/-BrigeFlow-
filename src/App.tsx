import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { insforge } from './lib/insforge';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import NetworkGraph from './pages/NetworkGraph';
import WeeklyReport from './pages/WeeklyReport';
import SharePage from './pages/SharePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import PublicSharePage from './pages/PublicSharePage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for Dev Mode override
    if (localStorage.getItem('dev_mode') === 'true') {
      setSession({ user: { id: 'dev-user' } });
      setLoading(false);
      return;
    }

    insforge.auth.getCurrentSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Insforge SDK might not support onAuthStateChange in the same way.
    // For now, we rely on initial session check.
    // If needed, we can implement a poller or custom event.
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/s/:slug" element={<PublicSharePage />} />
        <Route path="/" element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }>
          <Route index element={<Dashboard />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="network" element={<NetworkGraph />} />
          <Route path="report" element={<WeeklyReport />} />
          <Route path="share" element={<SharePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
