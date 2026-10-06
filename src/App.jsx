import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RequireRole, RequireSession } from './components/Guards.jsx';
import InspectorLayout from './components/inspector/InspectorLayout.jsx';
import InspectionDetail from './pages/inspector/InspectionDetail.jsx';
import InspectorDashboard from './pages/inspector/InspectorDashboard.jsx';
import InspectorSection from './pages/inspector/InspectorSection.jsx';
import MyInspections from './pages/inspector/MyInspections.jsx';
import MyViolations from './pages/inspector/MyViolations.jsx';
import Profile from './pages/inspector/Profile.jsx';
import StartInspection from './pages/inspector/StartInspection.jsx';
import SubmissionSuccess from './pages/inspector/SubmissionSuccess.jsx';
import ViolationDetail from './pages/inspector/ViolationDetail.jsx';
import InspectorAlerts from './pages/inspector/InspectorAlerts.jsx';
import InspectorTasks from './pages/inspector/InspectorTasks.jsx';
import ManagerLayout from './components/manager/ManagerLayout.jsx';
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import ManagerViolations from './pages/manager/ManagerViolations.jsx';
import ManagerViolationDetail from './pages/manager/ManagerViolationDetail.jsx';
import ManagerZones from './pages/manager/ManagerZones.jsx';
import SupervisorLayout from './components/supervisor/SupervisorLayout.jsx';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard.jsx';
import SupervisorActionDetail from './pages/supervisor/SupervisorActionDetail.jsx';
import VerificationLayout from './components/verification/VerificationLayout.jsx';
import VerificationQueue from './pages/verification/VerificationQueue.jsx';
import VerificationReview from './pages/verification/VerificationReview.jsx';
import DgmsLayout from './components/dgms/DgmsLayout.jsx';
import DgmsAuditDashboard from './pages/dgms/DgmsAuditDashboard.jsx';
import DgmsComplianceReport from './pages/dgms/DgmsComplianceReport.jsx';
import SafetyDashboard from './pages/safety/SafetyDashboard.jsx';
import CorporateDashboard from './pages/corporate/CorporateDashboard.jsx';
import ContractorDashboard from './pages/contractor/ContractorDashboard.jsx';
import Login from './pages/Login.jsx';
import RolePlaceholder from './pages/RolePlaceholder.jsx';
import RoleSelect from './pages/RoleSelect.jsx';

// /field-inspector/... is an alias for the existing /inspector/... routes.
function FieldInspectorAlias() {
  const { pathname, search } = useLocation();
  const rest = pathname
    .replace(/^\/field-inspector/, '')
    .replace(/^\/inspections/, '/my-inspections')
    .replace(/^\/violations/, '/my-violations');
  return <Navigate to={`/inspector${rest}${search}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/login/:roleId" element={<Login />} />
      <Route path="/field-inspector/*" element={<FieldInspectorAlias />} />

      {/* Field Inspector workspace */}
      <Route
        path="/inspector"
        element={
          <RequireRole roleId="inspector">
            <InspectorLayout />
          </RequireRole>
        }
      >
        <Route index element={<InspectorDashboard />} />
        <Route path="start-inspection" element={<StartInspection />} />
        <Route path="start-inspection/submitted/:id" element={<SubmissionSuccess />} />
        <Route path="my-inspections" element={<MyInspections />} />
        <Route path="my-inspections/:id" element={<InspectionDetail />} />
        <Route path="my-violations" element={<MyViolations />} />
        <Route path="my-violations/:id" element={<ViolationDetail />} />
        <Route path="alerts" element={<InspectorAlerts />} />
        <Route path="assigned-tasks" element={<InspectorTasks />} />
        <Route path="profile" element={<Profile />} />
        <Route path=":section" element={<InspectorSection />} />
      </Route>

      {/* Mine Manager workspace */}
      <Route
        path="/manager"
        element={
          <RequireRole roleId="manager">
            <ManagerLayout />
          </RequireRole>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="violations" element={<ManagerViolations />} />
        <Route path="violations/:id" element={<ManagerViolationDetail />} />
        <Route path="zones" element={<ManagerZones />} />
      </Route>

      {/* Supervisor workspace */}
      <Route
        path="/supervisor"
        element={
          <RequireRole roleId="supervisor">
            <SupervisorLayout />
          </RequireRole>
        }
      >
        <Route index element={<SupervisorDashboard />} />
        <Route path="actions/:id" element={<SupervisorActionDetail />} />
      </Route>

      {/* Verification Center (Differentiator Stage) */}
      <Route
        path="/verification"
        element={
          <RequireSession>
            <VerificationLayout />
          </RequireSession>
        }
      >
        <Route index element={<VerificationQueue />} />
        <Route path="review/:id" element={<VerificationReview />} />
      </Route>

      {/* DGMS Regulatory & Audit Workspace (Stage 6) */}
      <Route
        path="/dgms"
        element={
          <RequireRole roleId="dgms">
            <DgmsLayout />
          </RequireRole>
        }
      >
        <Route index element={<DgmsAuditDashboard />} />
        <Route path="report" element={<DgmsComplianceReport />} />
      </Route>

      {/* Safety Officer Workspace */}
      <Route
        path="/safety"
        element={
          <RequireRole roleId="safety">
            <SafetyDashboard />
          </RequireRole>
        }
      />

      {/* Corporate Multi-Mine Rollup Workspace */}
      <Route
        path="/corporate"
        element={
          <RequireRole roleId="corporate">
            <CorporateDashboard />
          </RequireRole>
        }
      />

      {/* Contractor Portal Workspace */}
      <Route
        path="/contractor"
        element={
          <RequireRole roleId="contractor">
            <ContractorDashboard />
          </RequireRole>
        }
      />


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
