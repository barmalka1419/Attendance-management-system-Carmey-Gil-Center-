import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmotionSelection from '../EmotionSelection/EmotionSelection';
import './PatientSelectionPage.css';
import { speakText } from '../../utils/speech'; // פונקציית ההקראה
import { translateText } from '../../utils/translation'; // פונקציית התרגום

function PatientSelectionPage() {
  const { guideId } = useParams();
  const [patients, setPatients] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [translatedTexts, setTranslatedTexts] = useState({
    pageTitle: '',
    successMessage: '',
    selectPatient: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // שמירת השפה שנבחרה מ-localStorage
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    // תרגום טקסטים בהתאם לשפה שנבחרה
    const loadTranslations = async () => {
      const newTexts = {
        pageTitle: await translateText('Attendance Registration: Select a Patient', selectedLanguage),
        successMessage: await translateText('Registration was successful!', selectedLanguage),
        selectPatient: await translateText('Select a Patient:', selectedLanguage),
      };
      setTranslatedTexts(newTexts);
    };

    loadTranslations();
  }, []);

  useEffect(() => {
    fetch(`http://localhost:500/api/guides/${guideId}/patients`)
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error('Error fetching patients:', error));
  }, [guideId]);

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    // תרגום שם המטופל אם השפה הנבחרת אינה עברית
    const translatedPatientName =
      selectedLanguage === 'he' ? patient.name : await translateText(patient.name, selectedLanguage);

    // יצירת טקסט להקראה
    const textToSpeak = `${translatedTexts.selectPatient} ${translatedPatientName}`;
    speakText(textToSpeak, selectedLanguage); // שימוש בפונקציה הקיימת עם השפה שנבחרה
  };

  const sendSuspiciousEmotionEmail = (patient, emotion) => {
    fetch('http://localhost:500/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientName: patient.name,
        patientId: patient.id,
        emotion: emotion.label,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
        return response.json();
      })
      .then((data) => console.log('Email sent:', data))
      .catch((error) => console.error('Error sending email:', error));
  };

  const handleEmotionSelect = (emotion) => {
    if (!selectedPatient) {
      console.error('No patient selected');
      return;
    }


    fetch(`http://localhost:500/api/attendance/${selectedPatient.id}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion: emotion.label }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Attendance updated:', data);

        if (emotion.suspicious) {
          console.log('Suspicious emotion detected, sending email...');
          sendSuspiciousEmotionEmail(selectedPatient, emotion);
        }

        setIsPopupOpen(true);
        setTimeout(() => {
          setIsPopupOpen(false);
          navigate('/');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error updating attendance:', error);
        alert(error.message);
      });
  };

  return (
    <div className="patient-selection-page">
      <header className="page-header">
        <h2>{translatedTexts.pageTitle}</h2>
      </header>

      {!selectedPatient ? (
        <div className="patient-grid">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => handlePatientSelect(patient)}
            >
              <img src={patient.imageUrl} alt={patient.name} className="patient-image" />
              <p>{patient.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmotionSelection onSelectEmotion={handleEmotionSelect} />
      )}

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{translatedTexts.successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientSelectionPage;
