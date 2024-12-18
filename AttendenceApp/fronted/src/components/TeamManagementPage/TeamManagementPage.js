import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa'; 
import './TeamManagementPage.css';
import { translateText } from '../../utils/translation'; 

function TeamManagementPage() {
  const navigate = useNavigate();  // React Router's navigation hook
  const [translatedTexts, setTranslatedTexts] = useState({
    header: '',
    editButton: '',
    deleteButton: '',
    addButton: '',
  });

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    // Load translations dynamically based on the selected language
    const loadTranslations = async () => {
      const newTexts = {
        header: await translateText('Team Management', selectedLanguage),
        editButton: await translateText('Edit Team Member', selectedLanguage),
        deleteButton: await translateText('Delete Team Member', selectedLanguage),
        addButton: await translateText('Add Team Member', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Update the state with translated text
    };

    loadTranslations();
  }, []);

  // Handle navigation to the "Edit Team Member" page
  const handleEditTeamMember = () => {
    navigate('/edit-team-member');
  };

  // Handle navigation to the "Delete Team Member" page
  const handleDeleteTeamMember = () => {
    navigate('/delete-team-member');
  };
  
// Handle navigation to the "Add Team Member" page
  const handleAddTeamMember = () => {
    navigate('/add-team-member');
  };

  return (
    <div className="team-management-page">
      <div className="header">
        <h1>{translatedTexts.header}</h1>
      </div>
      <div className="content">
        <div className="team-buttons">
          <button onClick={handleEditTeamMember} className="button">
            <FaEdit size={50} className="icon" />
            <span>{translatedTexts.editButton}</span>
          </button>
          <button onClick={handleDeleteTeamMember} className="button">
            <FaTrashAlt size={50} className="icon" />
            <span>{translatedTexts.deleteButton}</span>
          </button>
          <button onClick={handleAddTeamMember} className="button">
            <FaUserPlus size={50} className="icon" />
            <span>{translatedTexts.addButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamManagementPage;
