import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole, RequireSession } from './components/Guards.jsx';
import InspectorLayout from './components/inspector/InspectorLayout.jsx';
import InspectorDashboard from './pages/inspector/InspectorDashboard.jsx';
import InspectorSection from './pages/inspector/InspectorSection.jsx';
import Login from './pages/Login.jsx';
import RolePlaceholder from './pages/RolePlaceholder.jsx';
import RoleSelect from './pages/RoleSelect.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/login/:roleId" element={<Login />} />

      {/* Field Inspector workspace (built) */}
      <Route
        path="/inspector"
        element={
          <RequireRole roleId="inspector">
            <InspectorLayout />
          </RequireRole>
        }
      >
        <Route index element={<InspectorDashboard />} />
        <Route path=":section" element={<InspectorSection />} />
      </Route>

      {/* Every other role lands here until its dashboard is built */}
      <Route
        path="/workspace/:roleId"
        element={
          <RequireSession>
            <RolePlaceholder />
          </RequireSession>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
