import React, { useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa'; // Icon for profile
import './GuideDashboard.css';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../../utils/translation'; 
function GuideDashboard() {
  const navigate = useNavigate(); // Hook for navigation between pages
  const [translatedTexts, setTranslatedTexts] = useState({
    welcome: '',
    serviceRecipients: '',
    attendanceManagement: '',
    generateReports: '',
    teamManagement: '',
  });

  // Load translations dynamically based on the selected language
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        welcome: await translateText('Welcome, Guide', selectedLanguage),
        serviceRecipients: await translateText('Manage of Service Recipients', selectedLanguage),
        attendanceManagement: await translateText('Manage Attendance', selectedLanguage),
        generateReports: await translateText('Generate Reports', selectedLanguage),
        teamManagement: await translateText('Manage Team', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Update the state with translated texts
    };

    loadTranslations(); // Call the function to load translations
  }, []);

// Navigate to attendance management page  
  const handleAttendanceManagement = () => {
    navigate('/attendance-management');
  };

// Navigate to service recipients management page
  const handleServiceRecipientsManagement = () => {
    navigate('/service-recipients-management');
  };

  // Navigate to reports generation page
  const handleGenerateReports = () => {
    navigate('/report'); // ניווט לדף הפקת הדוחות
  };

  // Navigate to team management page
  const handleTeamManagement = () => {
    navigate('/team-management'); // New path for team management
  };

  return (
    <div className="guide-dashboard">
      <div className="header">{translatedTexts.welcome}</div>
      <div className="content">
        <div className="profile-image">
          <FaUserTie size={200} color="#1976d2" />
        </div>
        <div className="dashboard-buttons-grid">
          <button onClick={handleServiceRecipientsManagement}>
            {translatedTexts.serviceRecipients}
          </button>
          <button onClick={handleAttendanceManagement}>
            {translatedTexts.attendanceManagement}
          </button>
          <button onClick={handleGenerateReports}>
            {translatedTexts.generateReports}
          </button>
          <button onClick={handleTeamManagement}>
            {translatedTexts.teamManagement}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideDashboard;
