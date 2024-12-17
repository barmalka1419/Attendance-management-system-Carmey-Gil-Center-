import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuideSelectionPage.css';
import { speakText } from '../../utils/speech'; // פונקציית ההקראה הקיימת
import { translateText } from '../../utils/translation'; // פונקציית התרגום

function GuideSelectionPage() {
  const [guides, setGuides] = useState([]);
  const [translatedTexts, setTranslatedTexts] = useState({
    pageTitle: '',
    selectGuide: '',
    selectedGuide: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        pageTitle: await translateText('Attendance Registration: Select a Guide', selectedLanguage),
        selectGuide: await translateText('Select a Guide', selectedLanguage),
        selectedGuide: await translateText('The selected guide is:', selectedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  useEffect(() => {
    fetch('http://localhost:500/api/guides/allguides')
      .then((response) => response.json())
      .then((data) => setGuides(data))
      .catch((error) => console.error('Error fetching guides:', error));
  }, []);
  console.log("make it !!!!")
  const handleGuideSelection = async (guideId, guideName) => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    // תרגום שם המדריך אם השפה הנבחרת אינה עברית
    const translatedGuideName =
      selectedLanguage === 'he' ? guideName : await translateText(guideName, selectedLanguage);

    // יצירת טקסט להקראה
    const textToSpeak = `${translatedTexts.selectedGuide} ${translatedGuideName}`;
    speakText(textToSpeak, selectedLanguage);

    navigate(`/patients/${guideId}`);
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
            <img
              key={guide._id}
              src={guide.imageUrl}
              alt={guide.name}
              className="guide-image"
              onClick={() => handleGuideSelection(guide._id, guide.name)}
            />
          ))}
      </div>
    </div>
  );
}

export default GuideSelectionPage;
