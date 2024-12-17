import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteRecipientPage.css';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית התרגום

function DeleteRecipientPage() {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    title: '',
    deleteButton: '',
    errorFetching: '',
    selectToDelete: '',
    successMessage: '',
    errorDeleting: '',
  });

  useEffect(() => {
    axios
      .get('http://localhost:500/api/recipients/all_patients')
      .then((response) => {
        setRecipients(response.data);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching recipients:', error);
        setError(translatedTexts.errorFetching);
      });

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('Delete Service Recipient', selectedLanguage),
        deleteButton: await translateText('Delete', selectedLanguage),
        errorFetching: await translateText('Error loading recipients', selectedLanguage),
        selectToDelete: await translateText('Please select a recipient to delete', selectedLanguage),
        successMessage: await translateText('Recipient deleted successfully', selectedLanguage),
        errorDeleting: await translateText('Error deleting recipient', selectedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  const handleDelete = () => {
    if (!selectedRecipientId) {
      setError(translatedTexts.selectToDelete);
      return;
    }

    axios
      .delete(`http://localhost:500/api/recipients/${selectedRecipientId}`)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage);
        setRecipients((prevRecipients) =>
          prevRecipients.filter((recipient) => recipient._id !== selectedRecipientId)
        );
        setSelectedRecipientId('');
      })
      .catch((error) => {
        console.error('Error deleting recipient:', error);
        setError(translatedTexts.errorDeleting);
      });
  };

  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
      window.location.reload(); // רענון הדף לאחר 2 שניות
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
