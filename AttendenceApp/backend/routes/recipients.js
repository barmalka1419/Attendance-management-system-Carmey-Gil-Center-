const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient'); // מודל של מקבל שירות
const Guide = require('../models/Guid'); // מודל של מדריך

// Add a new service recipient
// Endpoint: /api/recipients/addNewRecipient
// Used in AddRecipientPage
router.post('/addNewRecipient', async (req, res) => {
    const { id, name, imageUrl, groupId, guideId } = req.body;
  
    // Validate required fields
    if (!id || !name || !imageUrl || !groupId || !guideId) {
      return res.status(400).json({ message: 'נא למלא את כל השדות' });
    }
    try {
      // Check if the guide exists
      const guideExists = await Guide.findById(guideId);
      if (!guideExists) {
        return res.status(404).json({ message: 'המדריך לא נמצא' });
      }
  
      // Create a new service recipient
      const newPatient = new Patient({ id, name, imageUrl, groupId, guideId });
      const savedPatient = await newPatient.save();
  
      res.status(201).json(savedPatient); // Return the newly created service recipien
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ message: 'שגיאה ביצירת מקבל השירות' });
    }
  });
  

// Get all service recipients
// Endpoint: /api/patients/all_patients
// Used in AttendanceManagement
router.get('/all_patients', async (req, res) => {
  try {
     // Retrieve all service recipients
    const recipients = await Patient.find(); 
    res.status(200).json(recipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ message: 'שגיאה בטעינת מקבלי השירות' });
  }
});

// Delete a service recipient by ID
// Endpoint: /api/recipients/:id
// Used in AttendanceManagement
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


// Update service recipient details
// Endpoint: /api/recipients/:id
// Used in EditRecipientPage
router.put('/:id', async (req, res) => {
  const { id } = req.params; // MongoDB _id of the recipient
  const { id: customId, name, imageUrl, groupId, guideId } = req.body; // New recipient data

  // Validate required fields
  if (!customId || !name || !imageUrl || !groupId || !guideId) {
    return res.status(400).json({ message: 'נא למלא את כל השדות' });
  }

  try {
    // Check if the provided custom ID already exists in another document
    const existingRecipient = await Patient.findOne({ id: customId, _id: { $ne: id } });
    if (existingRecipient) {
      return res.status(400).json({ message: 'תעודת הזהות האישית כבר קיימת במערכת עבור מקבל שירות אחר' });
    }

    // Update the recipient details in the database, including the custom ID
    const updatedRecipient = await Patient.findOneAndUpdate(
      { _id: id }, // Find by MongoDB _id
      { id: customId, name, imageUrl, groupId, guideId }, // Update fields
      { new: true, runValidators: true } // Return the updated document and validate input
    );

    if (!updatedRecipient) {
      return res.status(404).json({ message: 'מקבל השירות לא נמצא' });
    }

    res.status(200).json(updatedRecipient); // Return the updated recipient details
  } catch (error) {
    console.error('Error updating recipient:', error);
    res.status(500).json({ message: 'שגיאה בעדכון מקבל השירות', error: error.message });
  }
});



// Get attendance records of a specific patient
// Endpoint: /api/patients/:patientId/attendance
// Used in AttendanceManagement
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
      // Filter attendance records by date
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