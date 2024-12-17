import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrashAlt, FaEdit } from 'react-icons/fa'; // ייבוא אייקונים
import './ServiceRecipientsManagement.css';
import { translateText } from '../../utils/translation'; // ייבוא פונקציית התרגום

function ServiceRecipientsManagement() {
  const navigate = useNavigate();
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    addRecipient: '',
    deleteRecipient: '',
    editRecipient: '',
  });

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        header: await translateText('Service Recipients Management', selectedLanguage),
        addRecipient: await translateText('Add Service Recipient', selectedLanguage),
        deleteRecipient: await translateText('Delete Service Recipient', selectedLanguage),
        editRecipient: await translateText('Edit Service Recipient', selectedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  const handleAddRecipient = () => {
    navigate('/add-recipient'); // נווט לדף הוספת מקבל שירות
  };

  const handleDeleteRecipient = () => {
    navigate('/delete-recipient'); // נווט לדף מחיקת מקבל שירות
  };

  const handleEditRecipient = () => {
    navigate('/edit-recipient'); // נווט לדף עריכת מקבל שירות
  };

  return (
    <div className="service-recipients-management">
      <div className="header">{translatedTexts.header}</div>
      <div className="content">
        <div className="profile-image">
          <img
            src="https://nursing-ethics.org.il/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-10-15-at-12.21.55_62420974-qdxtk6v9tfu5i1b888qoh6593q6oy8kune2axc09hc.jpg"
            alt="Service Management"
            style={{ borderRadius: '0%', border: '1px solid #1976d2' }}
          />
        </div>
        <div className="dashboard-buttons">
          <button onClick={handleAddRecipient} className="button">
            <FaUserPlus size={24} className="icon" />
            <span>{translatedTexts.addRecipient}</span>
          </button>
          <button onClick={handleDeleteRecipient} className="button">
            <FaTrashAlt size={24} className="icon" />
            <span>{translatedTexts.deleteRecipient}</span>
          </button>
          <button onClick={handleEditRecipient} className="button">
            <FaEdit size={24} className="icon" />
            <span>{translatedTexts.editRecipient}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceRecipientsManagement;
