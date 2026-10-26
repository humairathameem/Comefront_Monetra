import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { FinanceProvider } from './context/FinanceContext';
import './index.css';
createRoot(document.getElementById('root')).render(<StrictMode><HashRouter><FinanceProvider><App /></FinanceProvider></HashRouter></StrictMode>);
