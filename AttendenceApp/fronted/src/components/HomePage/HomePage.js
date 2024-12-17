import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { FaUser, FaClipboard, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../../utils/translation';

function HomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('selectedLanguage') || 'he');
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    welcome: '',
    chooseOption: '',
    attendance: '',
    teamLogin: '',
    languageSelector: '',
  });

  useEffect(() => {
    const loadTranslations = async () => {
      const newTexts = {
        header: await translateText('Attendance Registration System', language),
        welcome: await translateText('Hello everyone', language),
        chooseOption: await translateText('Choose one of the following options', language),
        attendance: await translateText('Attendance Registration', language),
        teamLogin: await translateText('Team Login', language),
        languageSelector: await translateText('Choose Language:', language),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, [language]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('selectedLanguage', lang); // שמירת שפה
  };

  return (
    <div className="homepage">
      <header className="header">
        <h2>{translatedTexts.header}</h2>
      </header>
      <div className="main-content">
        <h1>{translatedTexts.welcome}</h1>
        <p>{translatedTexts.chooseOption}</p>
        <button className="attendance-button" onClick={() => navigate('/guide-selection')}>
          <FaClipboard style={{ marginRight: '10px' }} />
          {translatedTexts.attendance}
        </button>
        <button className="attendance-button" onClick={() => navigate('/team-login')}>
          <FaUser style={{ marginRight: '10px' }} />
          {translatedTexts.teamLogin}
        </button>
        <div className="language-selector">
          <p>
            <FaGlobe style={{ marginRight: '10px' }} />
            {translatedTexts.languageSelector}
          </p>
          <div className="language-buttons">
            <button onClick={() => handleLanguageChange('he')}>עברית</button>
            <button onClick={() => handleLanguageChange('en')}>English</button>
            <button onClick={() => handleLanguageChange('ru')}>Русский</button>
            <button onClick={() => handleLanguageChange('ar')}>العربية</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
