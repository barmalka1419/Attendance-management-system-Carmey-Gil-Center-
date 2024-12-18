import React, { useEffect, useState } from 'react';
import './EmotionSelection.css';
import { translateText } from '../../utils/translation'; 

function EmotionSelection({ onSelectEmotion }) {
  const [translatedTexts, setTranslatedTexts] = useState({
    title: ' ',
    emotions: [

    ],
  });

  // Fetch and translate texts based on the selected language
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    const loadTranslations = async () => {
      const newTexts = {
        title: await translateText('How are you feeling today', selectedLanguage),
        emotions: await Promise.all(
          [
            { label: 'Happy', icon: '😊', suspicious: false },
            { label: 'Funny', icon: '😜', suspicious: false },
            { label: 'Bored', icon: '🙄', suspicious: false },
            { label: 'Sad', icon: '😢', suspicious: true },
            { label: 'Angry', icon: '😡', suspicious: true },
            { label: 'Tired', icon: '😴', suspicious: false },
          ].map(async (emotion) => ({
            ...emotion,
            label: await translateText(emotion.label, selectedLanguage) ,  // Translate each emotion label
          }))
        ),
      };
      setTranslatedTexts(newTexts); // Update the state with translated texts
    };

    loadTranslations(); // Call the function to load translations
  }, []);

  return (
    <div className="emotion-selection" >
      <h2>{translatedTexts.title}</h2>
      <div className="emotion-grid">
        {translatedTexts.emotions.map((emotion) => (
          <div
            key={emotion.label}
            className="emotion-option"
            onClick={() => onSelectEmotion(emotion)}
          >
            <span className="emotion-icon">{emotion.icon}</span>
            <p>{emotion.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmotionSelection;
