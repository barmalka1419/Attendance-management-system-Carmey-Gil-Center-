import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteRecipientPage.css';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית התרגום
import { useParams, useNavigate } from 'react-router-dom';

function DeleteRecipientPage() {
  const [recipients, setRecipients] = useState([]); // State to store the list of recipients
  const [selectedRecipientId, setSelectedRecipientId] = useState(''); // State to track the selected recipient for deletion
  const [error, setError] = useState(''); // State to store error messages
  const [success, setSuccess] = useState('');  // State to store success messages
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    deleteButton: '',
    errorFetching: '',
    selectToDelete: '',
    successMessage: '',
    errorDeleting: '',
  }); // State to store the translated texts for the UI

  // Effect to fetch the list of recipients and load translations on component mount
  useEffect(() => {
    // Fetch all recipients from the server
    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/recipients/all_patients')
      .then((response) => {
        setRecipients(response.data); // Store the fetched recipients in state
        setError(''); // Clear any previous error messages
      })
      .catch((error) => {
        console.error('Error fetching recipients:', error);
        setError(translatedTexts.errorFetching);
      });

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he'; // Get the selected language from localStorage

    // Load translated texts dynamically based on the selected language    
    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Delete Service Recipient', selectedLanguage),
        deleteButton: await translateText('Delete', selectedLanguage),
        errorFetching: await translateText('Error loading recipients', selectedLanguage),
        selectToDelete: await translateText('Please select a recipient to delete', selectedLanguage),
        successMessage: await translateText('Recipient deleted successfully', selectedLanguage),
        errorDeleting: await translateText('Error deleting recipient', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Update the state with translated texts
    };

    loadTranslations();  // Trigger the translation loading
  }, []);
  const navigate = useNavigate();  // React Router hook for navigation
  // Function to handle deletion of a recipient
  const handleDelete = () => {
    if (!selectedRecipientId) {
      // Ensure a recipient is selected before attempting deletion
      setError(translatedTexts.selectToDelete);
      return;
    }

    axios
      .delete(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/recipients/${selectedRecipientId}`)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage);
        setRecipients((prevRecipients) =>
          prevRecipients.filter((recipient) => recipient._id !== selectedRecipientId)
        );
        setSelectedRecipientId(''); // Reset the selected recipient ID
      })
      .catch((error) => {
        console.error('Error deleting recipient:', error);
        setError(translatedTexts.errorDeleting);
      });
  };

  // Function to display a success message and reload the page
  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
      navigate('/')
      
    }, 2000);
  };

  return (
    <div className="delete-recipient-page">
      <h2>{translatedTexts.title}</h2>
      <div className="recipients-container">
        {recipients.map((recipient) => (
          <div
            key={recipient._id}
            className={`recipient-card ${selectedRecipientId === recipient._id ? 'selected' : ''}`}
            onClick={() => setSelectedRecipientId(recipient._id)}
          >
            <img src={recipient.imageUrl} alt={recipient.name} className="recipient-image" />
            <p>{recipient.name}</p>
          </div>
        ))}
      </div>
      <button onClick={handleDelete}>{translatedTexts.deleteButton}</button>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default DeleteRecipientPage;
