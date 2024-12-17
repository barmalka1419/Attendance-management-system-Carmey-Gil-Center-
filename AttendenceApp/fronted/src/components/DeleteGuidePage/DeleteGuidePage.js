import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeleteGuidePage.css';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית תרגום

function DeleteGuidePage() {
  const [guides, setGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    deleteButton: '',
    successMessage: '',
    errorMessage: '',
  });

  useEffect(() => {
    axios
      .get('http://localhost:500/api/guides/allguides')
      .then((response) => {
        setGuides(response.data);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching guides:', error);
        setError(translatedTexts.errorMessage || 'שגיאה בטעינת המדריכים');
      });
  }, [translatedTexts.errorMessage]);

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const translations = {
        header: await translateText('Delete Guide', selectedLanguage),
        deleteButton: await translateText('Delete', selectedLanguage),
        successMessage: await translateText('Guide deleted successfully', selectedLanguage),
        errorMessage: await translateText('Error loading guides', selectedLanguage),
      };
      setTranslatedTexts(translations);
    };

    loadTranslations();
  }, []);

  const handleDelete = () => {
    if (!selectedGuideId) {
      setError(translatedTexts.errorMessage || 'נא לבחור מדריך למחיקה');
      return;
    }

    axios
      .delete(`http://localhost:500/api/guides/${selectedGuideId}`)
      .then(() => {
        triggerSuccessMessage(translatedTexts.successMessage || 'המדריך נמחק בהצלחה');
        setGuides((prevGuides) =>
          prevGuides.filter((guide) => guide._id !== selectedGuideId)
        );
        setSelectedGuideId('');
      })
      .catch((error) => {
        console.error('Error deleting guide:', error);
        setError(translatedTexts.errorMessage || 'שגיאה במחיקת המדריך');
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
