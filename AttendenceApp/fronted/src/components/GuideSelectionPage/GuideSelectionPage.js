import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuideSelectionPage.css';
import { speakText } from '../../utils/speech'; 
import { translateText } from '../../utils/translation'; 

function GuideSelectionPage() {
  const [guides, setGuides] = useState([]); // State to store the list of guides
  const [translatedTexts, setTranslatedTexts] = useState({
    pageTitle: '',
    selectGuide: '',
    selectedGuide: '',
  });
  const navigate = useNavigate(); // Hook for navigation between pages

  // Load translations for the page text based on the selected language
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        pageTitle: await translateText('Attendance Registration: Select a Guide', selectedLanguage),
        selectGuide: await translateText('Select a Guide', selectedLanguage),
        selectedGuide: await translateText('The selected guide is:', selectedLanguage),
      };
      setTranslatedTexts(newTexts); // Update the state with translated text
    };

    loadTranslations(); // Trigger the translation loading
  }, []);

  // Fetch the list of guides when the component is mounted
  useEffect(() => {
    fetch('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/allguides')
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => setGuides(data)) // Store the guides in the state
      .catch((error) => console.error('Error fetching guides:', error));
  }, []);

 // Handle the selection of a guide
  const handleGuideSelection = async (guideId, guideName) => {

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';  // Get the selected language
    // Translate the guide name if the selected language is not Hebrew
    const translatedGuideName =
      selectedLanguage === 'he' ? guideName : await translateText(guideName, selectedLanguage);

   
    const textToSpeak = `${translatedTexts.selectedGuide} ${translatedGuideName}`;
    speakText(textToSpeak, selectedLanguage);  // Trigger text-to-speech

    navigate(`/patients/${guideId}`); // Navigate to the patients page for the selected guide
  };

  return (
    <div className="guide-selection-page">
      <header className="page-header">
        <h2>{translatedTexts.pageTitle}</h2>
      </header>
  
      <h3>{translatedTexts.selectGuide}</h3>
      <div className="guide-grid">
        {Array.isArray(guides) &&
          guides.map((guide) => (
            <figure key={guide._id} className="guide-image-container">
              <img
                src={guide.imageUrl}
                alt={guide.name}
                className="guide-image"
                onClick={() => handleGuideSelection(guide._id, guide.name)}
              />
              <figcaption>{guide.name}</figcaption> {/* שם המדריך */}
            </figure>
          ))}
      </div>
    </div>
  );
ד  
}

export default GuideSelectionPage;
