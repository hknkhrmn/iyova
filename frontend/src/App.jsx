import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analysis from './pages/Analysis';
import Meds from './pages/Meds';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="meds" element={<Meds />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
