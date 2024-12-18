import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteGuidePage.css';
import { translateText } from '../../utils/translation';

function DeleteGuidePage() {
  const [guides, setGuides] = useState([]); // State for storing the list of guides
  const [selectedGuideId, setSelectedGuideId] = useState(''); // State for tracking the selected guide for deletion
  const [error, setError] = useState(''); // State for displaying error messages
  const [success, setSuccess] = useState(''); // State for displaying success messages
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    deleteButton: '',
    successMessage: '',
    errorMessage: '',
  });// State for storing translated UI texts

  // Effect to fetch the list of guides from the server when the component mounts
  useEffect(() => {
    axios
      .get('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/allguides')
      .then((response) => {
        setGuides(response.data); // Store the fetched guides in state
        setError(''); // Clear any previous error messages
      })
      .catch((error) => {
        console.error('Error fetching guides:', error);
        setError(translatedTexts.errorMessage || 'שגיאה בטעינת המדריכים');
      });
  }, [translatedTexts.errorMessage]);

  // Effect to dynamically load translations based on the selected language
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const translations = {
        header: await translateText('Delete Guide', selectedLanguage),
        deleteButton: await translateText('Delete', selectedLanguage),
        successMessage: await translateText('Guide deleted successfully', selectedLanguage),
        errorMessage: await translateText('Error loading guides', selectedLanguage),
      };
      setTranslatedTexts(translations); // Update the state with translated texts
    };

    loadTranslations();  // Trigger the translation loading
  }, []);

  // Function to handle guide deletion
  const handleDelete = () => {
    if (!selectedGuideId) {
      // Ensure a guide is selected before attempting to delete
      setError(translatedTexts.errorMessage || 'נא לבחור מדריך למחיקה');
      return;
    }

    axios
      .delete(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/${selectedGuideId}`)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage || 'המדריך נמחק בהצלחה');
        setGuides((prevGuides) =>
          prevGuides.filter((guide) => guide._id !== selectedGuideId) // Remove the deleted guide from the state
        );
        setSelectedGuideId(''); // Reset the selected guide
      })
      .catch((error) => {
        console.error('Error deleting guide:', error);
        setError(translatedTexts.errorMessage || 'שגיאה במחיקת המדריך');
      });
  };

  // Function to trigger a success message with a timeout
  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
      window.location.reload(); 
    }, 3000);
  };

  return (
    <div className="delete-guide-page">
      <h2>{translatedTexts.header}</h2>
      <div className="guides-container">
        {guides.map((guide) => (
          <div
            key={guide._id}
            className={`guide-card ${selectedGuideId === guide._id ? 'selected' : ''}`}
            onClick={() => setSelectedGuideId(guide._id)}
          >
            <img src={guide.imageUrl} alt={guide.name} className="guide-image2" />
            <p>{guide.name}</p>
          </div>
        ))}
      </div>
      <button onClick={handleDelete}>{translatedTexts.deleteButton}</button>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default DeleteGuidePage;
