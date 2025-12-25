import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UseCases from './pages/UseCases';
import Prompts from './pages/Prompts';
import Activity from './pages/Activity';
import Results from './pages/Results';
import Visualizer from './pages/Visualizer';
import DatasetExplorer from './pages/DatasetExplorer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="use-cases" element={<UseCases />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="activity" element={<Activity />} />
          <Route path="results" element={<Results />} />
          <Route path="visualizer" element={<Visualizer />} />
          <Route path="use-cases/:id/explorer" element={<DatasetExplorer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
