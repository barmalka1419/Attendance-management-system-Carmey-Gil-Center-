const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const mongoose = require('mongoose');


// Endpoint to update an attendance record from AttendanceManagement
router.put('/:patientId/attendance-update', async (req, res) => {
  const { patientId } = req.params;
  const { _id, checkInTime, checkOutTime, date } = req.body;
  try {
    // Find patient by ID
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

      // Find the attendance record to update
    const attendanceRecord = patient.attendance.find(record => record._id.toString() === _id);
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

     // Update attendance fields if provided
    if (checkInTime) attendanceRecord.checkInTime = checkInTime;
    if (checkOutTime) attendanceRecord.checkOutTime = checkOutTime;
    if (date) attendanceRecord.date = new Date(date);
    // Save the updated patient document
    await patient.save();

    res.status(200).json({ message: 'Attendance updated successfully', attendance: patient.attendance });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance' });
  }
});


// Endpoint to automatically log attendance
router.post('/:patientId/attendance', async (req, res) => {
  const { patientId } = req.params;
  const currentTime = new Date();
  // Helper function to format time as HH:mm
  const get24HourTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0'); 
    const minutes = date.getMinutes().toString().padStart(2, '0'); 
    return `${hours}:${minutes}`;
  };

  try {
    // Find patient by ID
    const patient = await Patient.findOne({ id: patientId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

   
    const todayAttendance = patient.attendance.find(att => {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });

    // Update check-out time or create a new attendance record
    if (todayAttendance && !todayAttendance.checkOutTime) {
      
      todayAttendance.checkOutTime = get24HourTime(currentTime);
    } else if (!todayAttendance) {
     
      patient.attendance.push({
        date: currentTime,
        checkInTime: get24HourTime(currentTime),
        checkOutTime: null
      });
    } else {
     
      return res.status(400).json({ message: 'Attendance already complete for today' });
    }

    await patient.save();
    res.status(200).json({ message: 'Attendance updated successfully', patient });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// add new record attendance from AttendanceManagement
router.post('/:patientId/attendance-manual', async (req, res) => {
  const { patientId } = req.params;
  const { date, checkInTime, checkOutTime } = req.body;
 ("was fixing !");

  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    // Add the new attendance record
    patient.attendance.push({ date, checkInTime, checkOutTime });
    await patient.save();

    res.status(201).json({ message: 'Attendance record added manually', attendance: patient.attendance });
  } catch (error) {
    console.error('Error adding manual attendance record:', error);
    res.status(500).json({ message: 'Error adding manual attendance record' });
  }
});


// Endpoint to update a score in an attendance record
router.put('/update-score', async (req, res) => {
  const { patientId, attendanceId, score } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ message: 'Invalid attendanceId format' });
    }

    const attendanceObjectId = new mongoose.Types.ObjectId(attendanceId);
    // Update the score of the specified attendance record
    const updatedPatient = await Patient.findOneAndUpdate(
      { id: patientId, "attendance._id": attendanceObjectId },
      { $set: { "attendance.$.score": score } },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient or attendance record not found' });
    }

    res.status(200).json({ message: 'Score updated successfully', attendance: updatedPatient.attendance });
  } catch (err) {
    console.error('Error updating score:', err);
    res.status(500).json({ message: err.message });
  }
});


// Endpoint to delete an attendance record

router.delete('/:patientId/attendance-delete/:date', async (req, res) => {
  const { patientId, date } = req.params;
  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // המר את התאריך בפורמט ISO כדי להשוות אותו לתאריכים ב-DB
    const isoDate = new Date(date).toISOString().split('T')[0]; // שמירה רק על החלק של התאריך

    // סנן רשומות שלא תואמות את התאריך
    const initialLength = patient.attendance.length;
    patient.attendance = patient.attendance.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate !== isoDate;
    });

    if (initialLength === patient.attendance.length) {
      return res.status(404).json({ message: 'Attendance record not found for the given date' });
    }

    await patient.save();
    res.status(200).json({ message: 'Attendance record deleted successfully', attendance: patient.attendance });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Error deleting attendance record' });
  }
});

module.exports = router;
