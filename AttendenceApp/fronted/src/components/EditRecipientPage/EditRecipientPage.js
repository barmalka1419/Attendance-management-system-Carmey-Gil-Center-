import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import Select from 'react-select';
import 'react-simple-keyboard/build/css/index.css';
import './EditRecipientPage.css';
import { translateText } from '../../utils/translation'; 
import { useParams, useNavigate } from 'react-router-dom';

function EditRecipientPage() {
  const [recipients, setRecipients] = useState([]);  // State to hold the list of service recipients
  const [guides, setGuides] = useState([]); // State to hold the list of guides
  const [selectedRecipient, setSelectedRecipient] = useState(null); // State to hold the currently selected recipient
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    imageUrl: '',
    groupId: '',
    guideId: '',
  }); // State to manage the form data for editing

  const [focusedField, setFocusedField] = useState(''); // State to track the currently focused input field
  const [keyboardInput, setKeyboardInput] = useState(''); // State for the virtual keyboard input
  const [error, setError] = useState(''); // State for error messages
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    editRecipientTitle: '',
    saveChangesButton: '',
    idLabel: '',
    nameLabel: '',
    imageUrlLabel: '',
    groupIdLabel: '',
    guideLabel: '',
    errorFetchingRecipients: '',
    errorFetchingGuides: '',
    fillAllFields: '',
    successMessage: '',
    errorUpdating: '',
  });// State to store translated text for the UI


  // Fetch the recipients and guides when the component mounts
  useEffect(() => {
    // Fetch recipients and guides
    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/recipients/all_patients')
      .then((response) => setRecipients(response.data))
      .catch((error) => {
        console.error('Error fetching recipients:', error);
        setError(translatedTexts.errorFetchingRecipients);
      });

    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/allguides')
      .then((response) => setGuides(response.data))
      .catch((error) => {
        console.error('Error fetching guides:', error);
        setError(translatedTexts.errorFetchingGuides);
      });

    // Load translations
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';
    const loadTranslations = async () => {
      const newTexts = {
        editRecipientTitle: await translateText('Edit Service Recipient', selectedLanguage),
        saveChangesButton: await translateText('Save Changes', selectedLanguage),
        idLabel: await translateText('ID', selectedLanguage),
        nameLabel: await translateText('Name', selectedLanguage),
        imageUrlLabel: await translateText('Profile Image (URL)', selectedLanguage),
        groupIdLabel: await translateText('Group ID', selectedLanguage),
        guideLabel: await translateText('Select Guide', selectedLanguage),
        errorFetchingRecipients: await translateText('Error loading recipients', selectedLanguage),
        errorFetchingGuides: await translateText('Error loading guides', selectedLanguage),
        fillAllFields: await translateText('Please fill out all fields', selectedLanguage),
        successMessage: await translateText('Recipient updated successfully!', selectedLanguage),
        errorUpdating: await translateText('Error updating recipient', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Update the translated texts state
    };

    loadTranslations(); // Call the translation function
  }, []);

  // Handle changes in the virtual keyboard input
  const handleKeyboardChange = (input) => {
    setKeyboardInput(input); // Update the keyboard input state
    if (focusedField) {
      setFormData((prev) => ({ ...prev, [focusedField]: input })); // Update the corresponding field in formData
    }
  };
  const navigate = useNavigate();  // React Router hook for navigation

  // Handle input field changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Update the form data state
    if (name === focusedField) {
      setKeyboardInput(value); // Sync the virtual keyboard input
    }
  };

  // Handle changes in the guide selection dropdown 
  const handleGuideChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, guideId: selectedOption.value })); // Update the guideId in formData
  };

  // Handle form submission to update the recipient
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!formData.id || !formData.name || !formData.imageUrl || !formData.groupId || !formData.guideId) {
      setError(translatedTexts.fillAllFields);
      return;
    }

    axios
      .put(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/recipients/${selectedRecipient._id}`, formData)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage);
      })
      .catch((error) => {
        console.error('Error updating recipient:', error.response?.data || error.message);
        setError(translatedTexts.errorUpdating);
      });
  };
  // Display a success message and refresh the page after a delay
  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
      navigate('/edit-recipient'); // Refreshes the page after 3 seconds
    }, 3000);
  };

  // Generate options for the guide dropdown
  const guideOptions = guides.map((guide) => ({
    value: guide._id,
    label: `${guide.name} (${guide.id})`,
  }));

  return (
    <div className="edit-recipient-page">
      <h2>{translatedTexts.editRecipientTitle}</h2>
      <div className="recipients-container">
        {recipients.map((recipient) => (
          <div
            key={recipient._id}
            className={`recipient-card ${selectedRecipient?._id === recipient._id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedRecipient(recipient);
              setFormData({
                id: recipient.id,
                name: recipient.name,
                imageUrl: recipient.imageUrl,
                groupId: recipient.groupId,
                guideId: '',
              });
            }}
          >
            <img src={recipient.imageUrl} alt={recipient.name} className="recipient-image" />
            <p>{recipient.name}</p>
          </div>
        ))}
      </div>
      {selectedRecipient && (
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
            <div className="form-group2">
              <label htmlFor="guideSelection">{translatedTexts.guideLabel}</label>
              <Select
                id="guideSelection"
                options={guideOptions}
                value={guideOptions.find((option) => option.value === formData.guideId)}
                onChange={handleGuideChange}
                isSearchable
                placeholder={translatedTexts.guideLabel}
              />
            </div>
            <button type="submit">{translatedTexts.saveChangesButton}</button>
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

export default EditRecipientPage;
