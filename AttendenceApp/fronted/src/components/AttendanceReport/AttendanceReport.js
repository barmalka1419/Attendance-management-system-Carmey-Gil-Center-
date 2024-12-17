import React, { useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './AttendanceReport.css'; // קובץ העיצוב
import { translateText } from '../../utils/translation'; // פונקציית התרגום

function AttendanceReport() {
  const [email, setEmail] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    selectMonth: '',
    enterEmail: '',
    generateReport: '',
    generatingReport: '',
    fillAllFields: '',
    successMessage: '',
    errorMessage: '',
  });

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Attendance Report Generation', selectedLanguage),
        selectMonth: await translateText('Select Month', selectedLanguage),
        enterEmail: await translateText('Enter Email Address', selectedLanguage),
        generateReport: await translateText('Generate Report', selectedLanguage),
        generatingReport: await translateText('Generating Report...', selectedLanguage),
        fillAllFields: await translateText('Please fill all fields', selectedLanguage),
        successMessage: await translateText('Report sent successfully!', selectedLanguage),
        errorMessage: await translateText('Error sending report', selectedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (focusedField === 'email') {
      setKeyboardInput(e.target.value);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (focusedField === 'selectedMonth') {
      setKeyboardInput(e.target.value);
    }
  };

  const handleKeyboardChange = (input) => {
    setKeyboardInput(input);
    if (focusedField === 'email') {
      setEmail(input);
    } else if (focusedField === 'selectedMonth') {
      setSelectedMonth(input);
    }
  };

  const handleGenerateReport = () => {
    if (!email || !selectedMonth) {
      setMessage(translatedTexts.fillAllFields);
      return;
    }

    setIsLoading(true);
    setMessage('');

    fetch('http://localhost:500/api/reports/send-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guideId: 313393324,
        selectedMonth: selectedMonth,
        email: email,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Server error');
        }
      })
      .then(() => {
        setMessage(translatedTexts.successMessage);
        setTimeout(() => {
          setMessage('');
        }, 2000);
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage(translatedTexts.errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="report-container">
      <h2 className="report-title">{translatedTexts.title}</h2>
      <div className="form-group1">
        <label htmlFor="month" className="form-label">{translatedTexts.selectMonth}</label>
        <input
          id="month"
          className="form-input"
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          onFocus={() => setFocusedField('selectedMonth')}
        />
      </div>
      <div className="form-group1">
        <label htmlFor="email" className="form-label">{translatedTexts.enterEmail}</label>
        <input
          id="email"
          className="form-input"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onFocus={() => setFocusedField('email')}
          placeholder="email@example.com"
        />
      </div>
      <button
        className={`submit-button ${isLoading ? 'loading' : ''}`}
        onClick={handleGenerateReport}
        disabled={isLoading}
      >
        {isLoading ? translatedTexts.generatingReport : translatedTexts.generateReport}
      </button>
      {message && <p className="message">{message}</p>}
      {focusedField && (
        <Keyboard
          onChange={handleKeyboardChange}
          input={keyboardInput}
          onKeyPress={(button) => {
            if (button === '{bksp}') {
              handleKeyboardChange(keyboardInput.slice(0, -1));
            }
          }}
        />
      )}
    </div>
  );
}

export default AttendanceReport;
