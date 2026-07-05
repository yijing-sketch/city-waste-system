import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppData } from './hooks/useAppData';
import { DataContext } from './hooks/DataContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Dispatch from './pages/Dispatch';
import Report from './pages/Report';
import Analytics from './pages/Analytics';

export default function App() {
  const data = useAppData();

  return (
    <DataContext.Provider value={data}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dispatch" element={<Dispatch />} />
            <Route path="report" element={<Report />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </DataContext.Provider>
  );
}
