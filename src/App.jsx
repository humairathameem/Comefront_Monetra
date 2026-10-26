import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar, { NAV } from './components/Sidebar';
import Header from './components/Header';
import QuickAddModal from './components/QuickAddModal';
import { Plus } from 'lucide-react';
import { useFinance } from './context/FinanceContext';
import * as P from './pages';

export default function App() {
  const [open, setOpen] = useState(false);
  const { setModal } = useFinance();
  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main">
        <Header onMenu={() => setOpen(true)} />
        <main className="content">
          <Routes>
            {NAV.map((n) => <Route key={n.to} path={n.to} element={<n.page />} />)}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <button className="fab" onClick={() => setModal({})} aria-label="Add transaction"><Plus size={24} /></button>
      <QuickAddModal />
    </div>
  );
}
void P;
