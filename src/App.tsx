/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProcessDashboard from './pages/ProcessDashboard';
import ProcessDashboardCopy from './pages/ProcessDashboardCopy';
import RHDashboard from './pages/RHDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/processos" element={<ProcessDashboard />} />
        <Route path="/processos-copia" element={<ProcessDashboardCopy />} />
        <Route path="/rh" element={<RHDashboard />} />
      </Routes>
    </Router>
  );
}
