import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './EditGuidePage.css';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית תרגום

function EditGuidePage() {
  const [guides, setGuides] = useState([]); // State to hold the list of guides
  const [selectedGuide, setSelectedGuide] = useState(null); // State to hold the currently selected guide for editing
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    imageUrl: '',
  }); // State to hold the form data for the selected guide

  const [focusedField, setFocusedField] = useState(''); // State to track the currently focused input field
  const [keyboardInput, setKeyboardInput] = useState(''); // State for the virtual keyboard input
  const [error, setError] = useState(''); // State for error messages
  const [success, setSuccess] = useState(''); // State for success messages
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    idLabel: '',
    nameLabel: '',
    emailLabel: '',
    passwordLabel: '',
    imageUrlLabel: '',
    saveButton: '',
  }); // State to hold translated text for the UI


  // Fetch the list of guides on component mount
  useEffect(() => {
    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/allguides')
      .then((response) => setGuides(response.data)) // Store the fetched guides in state
      .catch((error) => {
        console.error('Error fetching guides:', error);
        setError('שגיאה בטעינת רשימת המדריכים');
      });
  }, []);

  //  // Load translations dynamically based on the selected language
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const translations = {
        header: await translateText('Edit Guide', selectedLanguage),
        idLabel: await translateText('ID', selectedLanguage),
        nameLabel: await translateText('Name', selectedLanguage),
        emailLabel: await translateText('Email', selectedLanguage),
        passwordLabel: await translateText('Password', selectedLanguage),
        imageUrlLabel: await translateText('Profile Image (URL)', selectedLanguage),
        saveButton: await translateText('Save Changes', selectedLanguage),
      };
      setTranslatedTexts(translations);  // Update the translations state
    };

    loadTranslations();
  }, []);

  // Handle changes from the virtual keyboard
  const handleKeyboardChange = (input) => {
    setKeyboardInput(input); // Update the keyboard input state
    if (focusedField) {
      setFormData((prev) => ({ ...prev, [focusedField]: input })); // Update the corresponding form field
    }
  };

  // Handle changes in the form inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Update the form data state
    if (name === focusedField) {
      setKeyboardInput(value); // Sync the virtual keyboard input
    }
  };

  // Handle the selection of a guide for editing
  const handleGuideSelection = (guide) => {
    setSelectedGuide(guide); // Set the selected guide in state
    setFormData({
      id: guide.id,
      name: guide.name,
      email: guide.email,
      password: guide.password,
      imageUrl: guide.imageUrl,
    }); // Populate the form with the selected guide's data
  };

  // Handle form submission to save changes
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (!formData.id || !formData.name || !formData.email || !formData.password || !formData.imageUrl) {
      setError('נא למלא את כל השדות');
      return;
    }

    // Send updated guide data to the server
    axios
      .put(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/${selectedGuide._id}`, formData)
      .then(() => {
        triggerSuccessMessage(translatedTexts.saveButton);
      })
      .catch((error) => {
        console.error('Error updating guide:', error.response?.data || error.message);
        setError('שגיאה בעדכון המדריך');
      });
  };

  // Display a success message and refresh the page
  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  return (
    <div className="edit-guide-page">
      <h2>{translatedTexts.header}</h2>
      <div className="guides-container">
        {guides.map((guide) => (
          <div
            key={guide._id}
            className={`guide-card ${selectedGuide?._id === guide._id ? 'selected' : ''}`}
            onClick={() => handleGuideSelection(guide)}
          >
            <img src={guide.imageUrl} alt={guide.name} className="guide-image1" />
            <p>{guide.name}</p>
          </div>
        ))}
      </div>
      {selectedGuide && (
        <>
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
            <button type="submit">{translatedTexts.saveButton}</button>
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
        </>
      )}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default EditGuidePage;
