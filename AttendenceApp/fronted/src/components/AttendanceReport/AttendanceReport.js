import React, { useState, useEffect } from 'react'; // React hooks for managing state and lifecycle.
import Keyboard from 'react-simple-keyboard'; // Virtual keyboard component.
import 'react-simple-keyboard/build/css/index.css'; 
import './AttendanceReport.css';  // Importing styles for the component.
import { translateText } from '../../utils/translation';  // Utility function for dynamic translations.


// Main functional component for attendance report generation.
function AttendanceReport() {
    // State variables for managing input fields, loading, feedback messages, and translations.
  const [email, setEmail] = useState('');   // State for email input
  const [selectedMonth, setSelectedMonth] = useState(''); // State for selected month input
  const [message, setMessage] = useState(''); // State for feedback messages
  const [isLoading, setIsLoading] = useState(false); // State for showing loading indicator while generating report
  const [focusedField, setFocusedField] = useState(''); // State to track which field is currently focused (email or month)
  const [keyboardInput, setKeyboardInput] = useState(''); // State for virtual keyboard input
  const [translatedTexts, setTranslatedTexts] = useState({ // State for storing translated text for different UI elements
    title: '',
    selectMonth: '',
    enterEmail: '',
    generateReport: '',
    generatingReport: '',
    fillAllFields: '',
    successMessage: '',
    errorMessage: '',
  });

  // Effect to load translations dynamically based on the selected language
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
      setTranslatedTexts(newTexts); // Set the translated texts to state
    }; 

    loadTranslations(); // Trigger translation loading on component mount
  }, []);

  // Handles changes in the email input field
  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Update email state with user input
    if (focusedField === 'email') {
      setKeyboardInput(e.target.value); // Sync keyboard input with email field
    }
  };

  // Handles changes in the month input field
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value); // Update selected month state with user input
    if (focusedField === 'selectedMonth') {
      setKeyboardInput(e.target.value); // Sync keyboard input with month field
    }
  };

  // Handles changes in the virtual keyboard input
  const handleKeyboardChange = (input) => {
    setKeyboardInput(input); // Update virtual keyboard input
    if (focusedField === 'email') {
      setEmail(input); // Sync email field with keyboard input
    } else if (focusedField === 'selectedMonth') {
      setSelectedMonth(input); // Sync month field with keyboard input
    }
  };

    // Handles the generation of the attendance report
  const handleGenerateReport = () => {
    if (!email || !selectedMonth) {   // Validation to ensure all required fields are filled
      setMessage(translatedTexts.fillAllFields); // Show error message if fields are empty
      return;
    }

    setIsLoading(true); // Show loading indicator
    setMessage(''); // Clear any previous messages

    // Send a POST request to generate the report
    fetch('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/reports/send-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedMonth: selectedMonth,
        email: email,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse JSON if request is successful
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
        setIsLoading(false); // Hide loading indicator
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
