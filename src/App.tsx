import { lazy, Suspense, useEffect, useState } from 'react';
import LandingPage from './LandingPage';

const DashboardPage = lazy(() => import('./DashboardPage'));
const currentPath = () => window.location.pathname.replace(/\/$/, '') || '/';

export default function App() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = path === '/dashboard'
      ? 'IRIS — Risk Dashboard'
      : 'IRIS — Intelligent Risk and Impact Simulator';
  }, [path]);

  const navigate = (to: '/' | '/dashboard') => {
    window.history.pushState({}, '', to);
    setPath(currentPath());
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (path === '/dashboard') {
    return <Suspense fallback={<div className="route-loading"><span>Opening the risk dashboard…</span></div>}>
      <DashboardPage onNavigateHome={() => navigate('/')} />
    </Suspense>;
  }
  return <LandingPage onOpenDashboard={() => navigate('/dashboard')} />;
}
