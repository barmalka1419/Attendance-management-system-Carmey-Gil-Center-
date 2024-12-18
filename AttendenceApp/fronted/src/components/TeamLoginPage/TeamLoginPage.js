import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeamLoginPage.css';
import Keyboard from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import { translateText } from '../../utils/translation';

function TeamLoginPage() {
  const [email, setEmail] = useState(''); // State to store the user's email input
  const [password, setPassword] = useState(''); // State to store the user's password input
  const [loginError, setLoginError] = useState(''); // State to store any login error messages
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    usernameLabel: '',
    passwordLabel: '',
    submitButton: '',
  });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // State to control virtual keyboard visibility
  const [focusedField, setFocusedField] = useState(''); // Tracks which input field is focused
  const navigate = useNavigate(); // React Router's navigation hook

  // Load translations dynamically based on the selected language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'he';
    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Login to the system', savedLanguage),
        usernameLabel: await translateText('Username', savedLanguage),
        passwordLabel: await translateText('Password', savedLanguage),
        submitButton: await translateText('Login', savedLanguage),
      };
      setTranslatedTexts(newTexts); // Update state with the translated texts
    };

    loadTranslations(); // Call the function to load translations
  }, []);

// Handle login form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoginError(''); // Reset any previous error messages
// API call to authenticate user
    fetch('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        alert(`ברוך הבא ${data.guide.name}`);
        navigate('/guide-dashboard');
      })
      .catch((error) => {
        setLoginError(error.message);
      });
  };

  const handleKeyboardInput = (input) => {
    if (focusedField === 'email') {
      setEmail(input); // Update email state if the email field is focused
    } else if (focusedField === 'password') {
      setPassword(input); // Update password state if the password field is focused
    }
  };

  return (
    <div className="team-login-page">
      <h2 >{translatedTexts.title}</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{translatedTexts.usernameLabel}</label>
          <input
            type="email"
            id="email"
            value={email}
            onFocus={() => {
              setKeyboardVisible(true);
              setFocusedField('email');
            }}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" >{translatedTexts.passwordLabel}</label>
          <input
            type="password"
            id="password"
            value={password}
            onFocus={() => {
              setKeyboardVisible(true);
              setFocusedField('password');
            }}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{translatedTexts.submitButton}</button>
      </form>
      {loginError && <p className="error-message">{loginError}</p>}
      {isKeyboardVisible && (
        <Keyboard
          onChange={(input) => handleKeyboardInput(input)}
          inputName={focusedField}
          onKeyPress={(button) => {
            if (button === '{enter}') {
              setKeyboardVisible(false);
            }
          }}
          layout={{
            default: [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              'q w e r t y u i o p [ ] \\',
              'a s d f g h j k l ; \' {enter}',
              'z x c v b n m , . /',
              '{space}',
            ],
          }}
          display={{
            '{bksp}': '⌫',
            '{enter}': '⏎',
            '{space}': '␣',
          }}
        />
      )}
    </div>
  );
}

export default TeamLoginPage;
