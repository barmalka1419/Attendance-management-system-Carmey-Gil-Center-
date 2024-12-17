const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient'); // מודל של מקבל שירות
const Guide = require('../models/Guid'); // מודל של מדריך

//add new recipient from AddRecipientPage http://localhost:500/api/recipients/addNewRecipient work
router.post('/addNewRecipient', async (req, res) => {
    const { id, name, imageUrl, groupId, guideId } = req.body;
  
    // בדיקת שדות חסרים
    if (!id || !name || !imageUrl || !groupId || !guideId) {
      return res.status(400).json({ message: 'נא למלא את כל השדות' });
    }
    try {
      // בדוק אם המדריך קיים
      const guideExists = await Guide.findById(guideId);
      if (!guideExists) {
        return res.status(404).json({ message: 'המדריך לא נמצא' });
      }
  
      // יצירת מקבל שירות חדש
      const newPatient = new Patient({ id, name, imageUrl, groupId, guideId });
      const savedPatient = await newPatient.save();
  
      res.status(201).json(savedPatient); // החזרת מקבל השירות שנשמר
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ message: 'שגיאה ביצירת מקבל השירות' });
    }
  });
  

// Get all recipients from the AttendanceManagement http://10.10.0.10:500/api/patients/all_patients work !
router.get('/all_patients', async (req, res) => {
  try {
    // שליפת כל מקבלי השירות
    const recipients = await Patient.find(); 
    res.status(200).json(recipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ message: 'שגיאה בטעינת מקבלי השירות' });
  }
});

// Delete recipient by ID from AttendanceManagement http://localhost:500/api/recipients/${selectedRecipientId} work
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: 'מקבל השירות לא נמצא' });
    }

    res.status(200).json({ message: 'מקבל השירות נמחק בהצלחה' });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    res.status(500).json({ message: 'שגיאה במחיקת מקבל השירות' });
  }
});


//assigning a guide to a service recipient http://localhost:500/api/recipients/${selectedRecipient._id} work !
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl, groupId, guideId } = req.body;

  if (!name || !imageUrl || !groupId || !guideId) {
    return res.status(400).json({ message: 'נא למלא את כל השדות' });
  }

  try {
    const updatedRecipient = await Patient.findByIdAndUpdate(
      id,
      { name, imageUrl, groupId, guideId },
      { new: true }
    );

    if (!updatedRecipient) {
      return res.status(404).json({ message: 'מקבל השירות לא נמצא' });
    }

    res.status(200).json(updatedRecipient);
  } catch (error) {
    console.error('Error updating recipient:', error);
    res.status(500).json({ message: 'שגיאה בעדכון מקבל השירות' });
  }
});


// get all the attendance records from AttendanceManagement http://10.10.0.10:500/api/patients/${patientId}/attendance work!
// also filter by selecting Date from AttendanceManagement http://10.10.0.10:500/api/patients/${selectedPatientId}/attendance?date=${filterDate} work !
router.get('/:patientId/attendance', async (req, res) => {
  const { patientId } = req.params;
  const { date } = req.query;
  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let filteredAttendance = patient.attendance;
    if (date) {
      filteredAttendance = filteredAttendance.filter(record => 
        new Date(record.date).toISOString().split('T')[0] === date
      );
    }

    res.status(200).json({ attendance: filteredAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});





module.exports = router;