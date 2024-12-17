import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './AddTeamMemberPage.css';
import { translateText } from '../../utils/translation'; // פונקציית תרגום

function AddTeamMemberPage() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    imageUrl: '',
  });
  const [focusedField, setFocusedField] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    idLabel: '',
    nameLabel: '',
    emailLabel: '',
    passwordLabel: '',
    imageUrlLabel: '',
    submitButton: '',
    successMessage: '',
    errorMessage: '',
  });

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const translations = {
        header: await translateText('Add New Team Member', selectedLanguage),
        idLabel: await translateText('ID', selectedLanguage),
        nameLabel: await translateText('Name', selectedLanguage),
        emailLabel: await translateText('Email', selectedLanguage),
        passwordLabel: await translateText('Password', selectedLanguage),
        imageUrlLabel: await translateText('Profile Image (URL)', selectedLanguage),
        submitButton: await translateText('Add Team Member', selectedLanguage),
        successMessage: await translateText('Team member added successfully!', selectedLanguage),
        errorMessage: await translateText('Please fill in all fields', selectedLanguage),
      };
      setTranslatedTexts(translations);
    };

    loadTranslations();
  }, []);

  const handleKeyboardChange = (input) => {
    setKeyboardInput(input);
    if (focusedField) {
      setFormData((prev) => ({ ...prev, [focusedField]: input }));
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === focusedField) {
      setKeyboardInput(value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { id, name, email, password, imageUrl } = formData;

    if (!id || !name || !email || !password || !imageUrl) {
      setError(translatedTexts.errorMessage);
      return;
    }

    axios
      .post('http://localhost:500/api/guides/addNewGuide', formData)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage);
        setFormData({ id: '', name: '', email: '', password: '', imageUrl: '' });
        setKeyboardInput('');
      })
      .catch((error) => {
        console.error('Error adding team member:', error.response?.data || error.message);
        setError(translatedTexts.errorMessage);
      });
  };

  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
      window.location.reload(); // רענון הדף לאחר 3 שניות
    }, 3000);
  };

  return (
    <div className="add-team-member-page">
      <h2>{translatedTexts.header}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="id">{translatedTexts.idLabel}</label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onFocus={() => setFocusedField('id')}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">{translatedTexts.nameLabel}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onFocus={() => setFocusedField('name')}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">{translatedTexts.emailLabel}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onFocus={() => setFocusedField('email')}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{translatedTexts.passwordLabel}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onFocus={() => setFocusedField('password')}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">{translatedTexts.imageUrlLabel}</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onFocus={() => setFocusedField('imageUrl')}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">{translatedTexts.submitButton}</button>
      </form>
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
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default AddTeamMemberPage;
