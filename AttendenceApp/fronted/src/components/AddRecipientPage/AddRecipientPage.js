import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './AddRecipientPage.css';
import { translateText } from '../../utils/translation'; 

function AddRecipientPage() {
  const [guides, setGuides] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    imageUrl: '',
    groupId: '',
    guideId: '',
  });
  const [focusedField, setFocusedField] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    idLabel: '',
    nameLabel: '',
    imageUrlLabel: '',
    groupIdLabel: '',
    guideSelectionLabel: '',
    submitButton: '',
  });

  // Fetch guides on component mount
  useEffect(() => {
    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/allguides')
      .then((response) => setGuides(response.data))
      .catch((error) => {
        console.error('Error fetching guides:', error);
        setError('שגיאה בטעינת רשימת המדריכים');
      });

    // Load translations for the selected language
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Add New Service Recipient', selectedLanguage),
        idLabel: await translateText('ID', selectedLanguage),
        nameLabel: await translateText('Name', selectedLanguage),
        imageUrlLabel: await translateText('Profile Image (URL)', selectedLanguage),
        groupIdLabel: await translateText('Group ID', selectedLanguage),
        guideSelectionLabel: await translateText('Select Guide', selectedLanguage),
        submitButton: await translateText('Add Recipient', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Updates the text with translated labels
    };

    loadTranslations(); // Asynchronous function to handle translations
  }, []);

  // focusedField is the current field in the form that the user is focus on
  const handleKeyboardChange = (input) => {
    setKeyboardInput(input); // Updates the virtual keyboard input
    if (focusedField) {
      setFormData((prev) => ({ ...prev, [focusedField]: input }));  // Syncs keyboard input with the focused form field
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Updates the selected guide in the form data
    if (name === focusedField) {
      setKeyboardInput(value);
    }
  };

  const handleGuideSelection = (selectedOption) => {
    setFormData((prev) => ({ ...prev, guideId: selectedOption.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();


    // Validation: Ensure all required fields are filled
    if (!formData.id || !formData.name || !formData.imageUrl || !formData.groupId || !formData.guideId) {
      setError('נא למלא את כל השדות');
      return;
    }

    // Sends the form data to the server
    axios
      .post('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/recipients/addNewRecipient', formData)
      .then(() => {
       // triggerSuccessMessage('מקבל השירות נוסף בהצלחה!');
        setFormData({ id: '', name: '', imageUrl: '', groupId: '', guideId: '' });
      })
      .catch((error) => {
        console.error('Error adding recipient:', error.response?.data || error.message);
        setError('שגיאה בהוספת מקבל השירות');
      });
  };

  const triggerSuccessMessage = (message) => {
    setSuccess(message); // Temporarily displays success message
    setTimeout(() => {
      setSuccess('');
      // Refreshes the page after 3 seconds
    }, 3000);
  };

    // Maps guides into options for the dropdown menu
  const guideOptions = guides.map((guide) => ({
    value: guide._id,
    label: `${guide.name} (${guide.id})`,
  }));

  return (
    <div className="add-recipient-page">
      <h2>{translatedTexts.title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="id">{translatedTexts.idLabel}</label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onFocus={() => setFocusedField('id')}  //Tracks the focused field for virtual keyboard interaction
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
        <div className="form-group">
          <label htmlFor="groupId">{translatedTexts.groupIdLabel}</label>
          <input
            type="text"
            id="groupId"
            name="groupId"
            value={formData.groupId}
            onFocus={() => setFocusedField('groupId')}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="guideSelection">{translatedTexts.guideSelectionLabel}</label>
          <Select
            id="guideSelection"
            options={guideOptions}
            value={guideOptions.find((option) => option.value === formData.guideId)} // Automatically selects the guide if already chosen
            onChange={handleGuideSelection}
            isSearchable
            placeholder={translatedTexts.guideSelectionLabel}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '8px',
                borderColor: '#80d4ff',
                boxShadow: 'none',
                '&:hover': { borderColor: '#50e3c2' },
                height: '50px',
                minHeight: '50px',
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '8px',
                zIndex: 9999,
              }),
              menuList: (base) => ({
                ...base,
                color: '#000',
                fontSize: '16px',
              }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? '#f0f8ff' : '#fff',
                color: '#000',
                fontSize: '18px',
                padding: '10px',
              }),
            }}
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
              handleKeyboardChange(keyboardInput.slice(0, -1)); // Handles the backspace button functionality for the virtual keyboard
            }
          }}
        />
      )}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default AddRecipientPage;
