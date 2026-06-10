import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Knowledge from '@/pages/Knowledge';
import KnowledgeDetail from '@/pages/KnowledgeDetail';
import Skills from '@/pages/Skills';
import Tools from '@/pages/Tools';
import Materials from '@/pages/Materials';
import Logs from '@/pages/Logs';
import LogEditor from '@/pages/LogEditor';
import LogDetail from '@/pages/LogDetail';
import Statistics from '@/pages/Statistics';
import ShoppingList from '@/pages/ShoppingList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/logs/new" element={<LogEditor />} />
          <Route path="/logs/:id/edit" element={<LogEditor />} />
          <Route path="/logs/:id" element={<LogDetail />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/stats" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
