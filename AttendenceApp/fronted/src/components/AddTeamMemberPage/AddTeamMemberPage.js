import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './AddTeamMemberPage.css';
import { translateText } from '../../utils/translation'; // פונקציית תרגום

function AddTeamMemberPage() {
    // State to manage form data and other UI elements

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    imageUrl: '',
  }); 
  const [focusedField, setFocusedField] = useState('');    // Tracks the current focused form field
  const [keyboardInput, setKeyboardInput] = useState(''); // Tracks the virtual keyboard input
  const [error, setError] = useState('');                // Error message state
  const [success, setSuccess] = useState('');           // Success message state
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


  // Effect to load translations dynamically based on the selected language
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
      setTranslatedTexts(translations); // Updates the state with translated texts
    };

    loadTranslations();
  }, []);

  const handleKeyboardChange = (input) => {
    setKeyboardInput(input); // Updates the virtual keyboard input state
    if (focusedField) {
      setFormData((prev) => ({ ...prev, [focusedField]: input })); // Updates the specific form field linked to the virtual keyboard
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));  // Updates the corresponding field in the form data
    if (name === focusedField) {
      setKeyboardInput(value);  // Synchronizes the virtual keyboard input with the form field
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { id, name, email, password, imageUrl } = formData;

    // Validate that all required fields are filled
    if (!id || !name || !email || !password || !imageUrl) {
      setError(translatedTexts.errorMessage);
      return;
    }

    // Sends the form data to the server
    axios
      .post('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/addNewGuide', formData)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage);
        setFormData({ id: '', name: '', email: '', password: '', imageUrl: '' });
        setKeyboardInput(''); // Resets the virtual keyboard input
      })
      .catch((error) => {
        console.error('Error adding team member:', error.response?.data || error.message);
        setError(translatedTexts.errorMessage); // Sets error message in case of failure
      });
  };

  const triggerSuccessMessage = (message) => {
    setSuccess(message);  // Temporarily displays the success message
    setTimeout(() => {
      setSuccess('');
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
            onFocus={() => setFocusedField('id')} // Tracks the focus on this field
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
            onFocus={() => setFocusedField('name')} // Tracks the focus on this field
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
            onFocus={() => setFocusedField('email')} // Tracks the focus on this field
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
            onFocus={() => setFocusedField('password')} // Tracks the focus on this field
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
            onFocus={() => setFocusedField('imageUrl')} // Tracks the focus on this field
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
              handleKeyboardChange(keyboardInput.slice(0, -1)); // Handles backspace functionality for the virtual keyboard
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
