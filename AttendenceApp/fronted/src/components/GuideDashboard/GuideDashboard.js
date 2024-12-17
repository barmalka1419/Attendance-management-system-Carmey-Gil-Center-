import React, { useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa'; // Icon for profile
import './GuideDashboard.css';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית התרגום

function GuideDashboard() {
  const navigate = useNavigate();
  const [translatedTexts, setTranslatedTexts] = useState({
    welcome: '',
    serviceRecipients: '',
    attendanceManagement: '',
    generateReports: '',
    teamManagement: '',
  });

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
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  const handleAttendanceManagement = () => {
    navigate('/attendance-management');
  };

  const handleServiceRecipientsManagement = () => {
    navigate('/service-recipients-management');
  };

  const handleGenerateReports = () => {
    navigate('/report'); // ניווט לדף הפקת הדוחות
  };

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
