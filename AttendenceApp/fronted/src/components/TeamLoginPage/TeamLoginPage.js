import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeamLoginPage.css';
import Keyboard from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import { translateText } from '../../utils/translation';

function TeamLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    usernameLabel: '',
    passwordLabel: '',
    submitButton: '',
  });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'he';
    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Login to the system', savedLanguage),
        usernameLabel: await translateText('Username', savedLanguage),
        passwordLabel: await translateText('Password', savedLanguage),
        submitButton: await translateText('Login', savedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoginError('');

    fetch('http://localhost:500/api/guides/login', {
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
      setEmail(input);
    } else if (focusedField === 'password') {
      setPassword(input);
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
