import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmotionSelection from '../EmotionSelection/EmotionSelection';
import './PatientSelectionPage.css';
import { speakText } from '../../utils/speech';
import { translateText } from '../../utils/translation';

function PatientSelectionPage() {
  const { guideId } = useParams(); // Retrieve the guideId parameter from the URL
  const [patients, setPatients] = useState([]); // State to store the list of patients
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to manage the visibility of the success popup
  const [selectedPatient, setSelectedPatient] = useState(null); // State to store the currently selected patient
  const [translatedTexts, setTranslatedTexts] = useState({
    pageTitle: '',
    successMessage: '',
    selectPatient: '',
  });
  const navigate = useNavigate();  // React Router hook for navigation

  // Load translations based on the selected language
  useEffect(() => {
    
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

   
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

  // Fetch the list of patients for the selected guide
  useEffect(() => {
    fetch(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/guides/${guideId}/patients`)
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error('Error fetching patients:', error));
  }, [guideId]);

  // Handle selecting a patient
  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient); // Update the selected patient

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';

    // Translate the patient's name if the selected language is not Hebrew
    const translatedPatientName =
      selectedLanguage === 'he' ? patient.name : await translateText(patient.name, selectedLanguage);

    const textToSpeak = `${translatedTexts.selectPatient} ${translatedPatientName}`;
    speakText(textToSpeak, selectedLanguage);  // Use the text-to-speech function
  };

// Send an email if a suspicious emotion is detected
  const sendSuspiciousEmotionEmail = (patient, emotion) => {
    fetch('https://attendance-management-system-carmey-gil-eo10.onrender.com/api/sendEmail', {
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

  // Handle selecting an emotion for the selected patient
  const handleEmotionSelect = (emotion) => {
    if (!selectedPatient) {
      console.error('No patient selected');
      return;
    }
    
    // Update attendance with the selected emotion
    fetch(`https://attendance-management-system-carmey-gil-eo10.onrender.com/api/attendance/${selectedPatient.id}/attendance`, {
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
