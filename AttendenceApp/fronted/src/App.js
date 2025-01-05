// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import GuideSelectionPage from './components/GuideSelectionPage/GuideSelectionPage';
import PatientSelectionPage from './components/PatientSelectionPage/PatientSelectionPage'; 
import TeamLoginPage from './components/TeamLoginPage/TeamLoginPage'; 
import GuideDashboard from './components/GuideDashboard/GuideDashboard';
import AttendanceManagement from './components/AttendanceManagement/AttendanceManagement'
import AddRecipientPage from './components/AddRecipientPage/AddRecipientPage';
import ServiceRecipientsManagement from './components/ServiceRecipientsManagement/ServiceRecipientsManagement';
import DeleteRecipientPage from './components/DeleteRecipientPage/DeleteRecipientPage';
import EditRecipientPage from './components/EditRecipientPage/EditRecipientPage'
import TeamManagementPage from './components/TeamManagementPage/TeamManagementPage';
import EditGuidePage from './components/EditGuidePage/EditGuidePage';
import DeleteGuidePage from './components/DeleteGuidePage/DeleteGuidePage';
import AddTeamMemberPage from './components/AddTeamMemberPage/AddTeamMemberPage'; 
import ReportPage from './components/AttendanceReport/AttendanceReport'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide-selection" element={<GuideSelectionPage />} />
        <Route path="/patients/:guideId" element={<PatientSelectionPage />} />
        <Route path="/team-login" element={<TeamLoginPage />} /> {/* נתיב חדש */}
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/attendance-management" element={<AttendanceManagement />} />
        <Route path="/add-recipient" element={<AddRecipientPage guideId={1} />} />
        <Route path="/service-recipients-management" element={<ServiceRecipientsManagement />} />
        <Route path="/delete-recipient" element={<DeleteRecipientPage />} />
        <Route path="/edit-recipient" element={<EditRecipientPage />} />
        <Route path="/team-management" element={<TeamManagementPage />} />
        <Route path="/edit-team-member" element={<EditGuidePage />} />
        <Route path="/delete-team-member" element={<DeleteGuidePage />} />
        <Route path="/add-team-member" element={<AddTeamMemberPage />} />
        <Route path="/report" element={<ReportPage />} />


      </Routes>
    </Router>
  );
}

export default App;
