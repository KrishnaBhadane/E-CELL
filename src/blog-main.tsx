import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import BlogPage from './pages/BlogPage';

createRoot(document.getElementById('root')!).render(<StrictMode><BlogPage /></StrictMode>);
