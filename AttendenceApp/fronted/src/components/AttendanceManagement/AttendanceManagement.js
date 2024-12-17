import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceManagement.css';
import { translateText } from '../../utils/translation'; // פונקציה לתרגום טקסטים

function AttendanceManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [editingScore, setEditingScore] = useState(null); // לניהול עריכת ציון

  const [newAttendance, setNewAttendance] = useState({
    date: '',
    checkInTime: '',
    checkOutTime: '',
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatedTexts, setTranslatedTexts] = useState({
    selectPatient: '',
    attendanceRecords: '',
    addAttendance: '',
    editAttendance: '',
    deleteAttendance: '',
    filterByDate: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
    update: '',
    cancel: '',
    errorMessage: '',
    successMessage: '',
  });

  // טעינת תרגומי הטקסטים בהתבסס על השפה הנבחרת
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'he';
    const loadTranslations = async () => {
      const translations = {
        selectPatient: await translateText('Select Patient', selectedLanguage),
        attendanceRecords: await translateText('Attendance Records', selectedLanguage),
        addAttendance: await translateText('Add new Attendance ', selectedLanguage),
        editAttendance: await translateText('Edit Attendance', selectedLanguage),
        deleteAttendance: await translateText('Delete Attendance', selectedLanguage),
        filterByDate: await translateText('Filter by Date', selectedLanguage),
        date: await translateText('Date', selectedLanguage),
        checkInTime: await translateText('Check-In Time', selectedLanguage),
        checkOutTime: await translateText('Check-Out Time', selectedLanguage),
        update: await translateText('Update', selectedLanguage),
        cancel: await translateText('Cancel', selectedLanguage),
        errorMessage: await translateText('An error occurred', selectedLanguage),
        successMessage: await translateText('Operation completed successfully!', selectedLanguage),
        updateScore: await translateText('Update Score', selectedLanguage),
        cancelUpdate: await translateText('Cancel Update', selectedLanguage), // In case you want the "Cancel" button translated too
        ScoreUpdate: await translateText('Score update',selectedLanguage),
      };
      setTranslatedTexts(translations);
    };
    loadTranslations();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:500/api/patients/all_patients')
      .then((response) => {
        setPatients(response.data);
        setError('');
      })
      .catch(() => {
        setError(translatedTexts.errorMessage);
      });
  }, [translatedTexts.errorMessage]);

  const handlePatientSelection = (patientId) => {
    setSelectedPatientId(patientId);
    fetchAttendanceRecords(patientId);
  };


  
  const handleUpdateScore = () => {
    const { attendanceId, currentScore } = editingScore;
    axios.put('http://localhost:500/api/attendance/update-score', {
        patientId: selectedPatientId, // משתמש ב-id המותאם אישית
        attendanceId,
        score: currentScore,
    })
    .then((response) => {
        setAttendanceRecords(response.data.attendance);
        setEditingScore(null);
        triggerSuccessMessage(translatedTexts.successMessage);
    })
    .catch((error) => {
        console.error('Error updating score:', error.response?.data || error.message);
        setError(translatedTexts.errorMessage);
    });
};


  
  
  const handleEditScore = (attendanceId, currentScore) => {
    console.log('handleEditScore called with:', {
      attendanceId,
      currentScore,
    });
  
    setEditingScore({
      attendanceId,
      currentScore,
    });
  };
  
  
  const fetchAttendanceRecords = (patientId) => {
    axios.get(`http://localhost:500/api/patients/${patientId}/attendance`)
      .then((response) => {
        setAttendanceRecords(response.data.attendance);
        setError('');
      })
      .catch(() => {
        setError(translatedTexts.errorMessage);
      });
  };

  const handleAddAttendance = () => {
    axios.post(`http://localhost:500/api/attendance/${selectedPatientId}/attendance-manual`, newAttendance)
      .then((response) => {
        setAttendanceRecords(response.data.attendance);
        setNewAttendance({ date: '', checkInTime: '', checkOutTime: '' });
        triggerSuccessMessage(translatedTexts.successMessage);
        setError('');
      })
      .catch(() => {
        setError(translatedTexts.errorMessage);
      });
  };


  const handleEditAttendance = (record) => {
    const formattedRecord = {
      ...record,
      checkInTime: record.checkInTime ? formatTimeTo24Hr(record.checkInTime) : '',
      checkOutTime: record.checkOutTime ? formatTimeTo24Hr(record.checkOutTime) : '',
    };
    console.log('Selected record for editing:', formattedRecord);

    setEditingRecord(formattedRecord);
  };

  const handleUpdateAttendance = () => {
    const updatedRecord = {
      ...editingRecord,
      date: new Date(editingRecord.date).toISOString().split('T')[0],
    };
    console.log('Sending updated record:', updatedRecord); // בדוק כאן

    axios.put(`http://localhost:500/api/attendance/${selectedPatientId}/attendance-update`, updatedRecord)
      .then((response) => {

        console.log('Server response:', response.data);

        setAttendanceRecords(response.data.attendance);
        setEditingRecord(null);
        triggerSuccessMessage(translatedTexts.successMessage);
        setError('');
      })
      .catch(() => {
        console.error('Error from server:', error.response?.data || error.message);

        setError(translatedTexts.errorMessage);
      });
  };

  const formatDateToIsraeli = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL').format(date);
  };


  
  const handleDeleteAttendance = (date) => {
    const isoDate = new Date(date).toISOString().split('T')[0];
    axios.delete(`http://localhost:500/api/attendance/${selectedPatientId}/attendance-delete/${isoDate}`)
      .then((response) => {
        setAttendanceRecords(response.data.attendance);
        triggerSuccessMessage(translatedTexts.successMessage);
        setError('');
      })
      .catch(() => {
        setError(translatedTexts.errorMessage);
      });
  };

  const handleFilterByDate = () => {
    if (selectedPatientId && filterDate) {
      axios.get(`http://localhost:500/api/patients/${selectedPatientId}/attendance?date=${filterDate}`)
        .then((response) => {
          setAttendanceRecords(response.data.attendance);
          setError('');
        })
        .catch(() => {
          setError(translatedTexts.errorMessage);
        });
    }
  };

  const formatTimeTo24Hr = (timeString) => {
    if (!timeString) return '';
    let [hours, minutes, modifier] = timeString.split(/[:\s]/);
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    let [hours, minutes] = timeString.split(':');
    let modifier = 'AM';
    hours = parseInt(hours, 10);

    if (hours >= 12) {
      modifier = 'PM';
      
    }
    if (hours === 0) hours = 12;

    return `${modifier} ${hours}:${minutes} `;
  };

  const triggerSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  return (
    <div className="attendance-management">
      <div className="patient-selection">
        <h2>{translatedTexts.selectPatient}</h2>
        <ul>
          {patients.map((patient) => (
            <li key={patient.id} onClick={() => handlePatientSelection(patient.id)}>
              {patient.name}
            </li>
          ))}
        </ul>
      </div>
  
      <div className="attendance-details">
        {selectedPatientId ? (
          <>
            <div className="date-filter">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <button onClick={handleFilterByDate}>{translatedTexts.filterByDate}</button>
            </div>
  
            <h2>{translatedTexts.attendanceRecords}</h2>
            <ul className="attendance-list">
              {attendanceRecords.map((record) => (
                <li key={record.date} className="record-item">
                  <div className="record-header">{formatDateToIsraeli(record.date)}</div>
                  <div className="record-details">
                    <span>כניסה: {formatTime(record.checkInTime)}</span>
                    <span> | </span>
                    <span>יציאה: {formatTime(record.checkOutTime)}</span>
                  </div>
                  <div className="record-score">
                    <span>ציון: {record.score || 'לא הוגדר'}</span>
                  </div>
                  <div className="record-buttons">
                    <button className="edit-button" onClick={() => handleEditAttendance(record)}>
                      {translatedTexts.editAttendance}
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteAttendance(record.date)}>
                      {translatedTexts.deleteAttendance}
                    </button>
                    <button className="update-button" onClick={() => handleEditScore(record._id, record.score || '')}>
                      {translatedTexts.updateScore}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {editingRecord && (
              <div className="edit-form">
                <h3>{translatedTexts.editAttendance}</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateAttendance();
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="editDate">{translatedTexts.date}</label>
                    <input
                      id="editDate"
                      type="date"
                      value={editingRecord.date.split('T')[0]}
                     

                      onChange={(e) => {
                        console.log('New selected date:', e.target.value);
                        setEditingRecord({ ...editingRecord, date: e.target.value });
                        console.log('Updated editingRecord:', { ...editingRecord, date: e.target.value });
                    }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCheckIn">{translatedTexts.checkInTime}</label>
                    <input
                      id="editCheckIn"
                      type="time"
                      value={editingRecord.checkInTime}
                      onChange={(e) => setEditingRecord({ ...editingRecord, checkInTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCheckOut">{translatedTexts.checkOutTime}</label>
                    <input
                      id="editCheckOut"
                      type="time"
                      value={editingRecord.checkOutTime}
                      onChange={(e) => setEditingRecord({ ...editingRecord, checkOutTime: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="submit-button">{translatedTexts.update}</button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditingRecord(null)}
                  >
                    {translatedTexts.cancel}
                  </button>
                </form>
              </div>
            )}

  
            {editingScore && (
            <div className="edit-score-form">
            <h3 className="form-title">{translatedTexts.ScoreUpdate}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateScore();
              }}
            >
              <div className="form-group">
                <label htmlFor="editScore"></label>
                <input
                  id="editScore"
                  type="number"
                  value={editingScore.currentScore}
                  onChange={(e) => setEditingScore({ ...editingScore, currentScore: e.target.value })}
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-button">{translatedTexts.updateScore}</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingScore(null)}
                >
                  {translatedTexts.cancelUpdate}
                </button>
              </div>
            </form>
          </div>
  
            )}
  
            <div className="new-attendance-form">
            <h3 className="form-title">{translatedTexts.addAttendance}</h3>
            <div className="form-group">
              <label htmlFor="attendanceDate">{translatedTexts.date}</label>
              <input
                id="attendanceDate"
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkInTime">{translatedTexts.checkInTime}</label>
              <input
                id="checkInTime"
                type="time"
                value={newAttendance.checkInTime}
                onChange={(e) => setNewAttendance({ ...newAttendance, checkInTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkOutTime">{translatedTexts.checkOutTime}</label>
              <input
                id="checkOutTime"
                type="time"
                value={newAttendance.checkOutTime}
                onChange={(e) => setNewAttendance({ ...newAttendance, checkOutTime: e.target.value })}
              />
            </div>
            <button className="submit-button" onClick={handleAddAttendance}>
              {translatedTexts.addAttendance}
            </button>
          </div>

          </>
        ) : (
          <p>{translatedTexts.selectPatient}</p>
        )}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
  
}

export default AttendanceManagement;
 