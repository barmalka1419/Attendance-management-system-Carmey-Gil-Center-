const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const mongoose = require('mongoose');



//update a attendace recorde from AttendanceManagement http://10.10.0.10:500/api/attendance/${selectedPatientId}/attendance-update work !
router.put('/:patientId/attendance-update', async (req, res) => {
  const { patientId } = req.params;
  const { _id, checkInTime, checkOutTime, date } = req.body;
  console.log("that also eas fixed");
  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // חיפוש לפי _id
    const attendanceRecord = patient.attendance.find(record => record._id.toString() === _id);
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // עדכון שדות
    if (checkInTime) attendanceRecord.checkInTime = checkInTime;
    if (checkOutTime) attendanceRecord.checkOutTime = checkOutTime;
    if (date) attendanceRecord.date = new Date(date);

    await patient.save();

    res.status(200).json({ message: 'Attendance updated successfully', attendance: patient.attendance });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance' });
  }
});


// רישום כניסה או יציאה למטופל לפי זיהוי from PatientSelectionPage
router.post('/:patientId/attendance', async (req, res) => {
  const { patientId } = req.params;
  const currentTime = new Date();
  console.log("/:patientId/attendance");
  // פונקציה ליצירת פורמט זמן 24 שעות (HH:mm)
  const get24HourTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0'); // שעות בפורמט שתי ספרות
    const minutes = date.getMinutes().toString().padStart(2, '0'); // דקות בפורמט שתי ספרות
    return `${hours}:${minutes}`;
  };

  try {
    const patient = await Patient.findOne({ id: patientId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // בדיקה אם יש רישום של כניסה לאותו יום
    const todayAttendance = patient.attendance.find(att => {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });

    if (todayAttendance && !todayAttendance.checkOutTime) {
      // אם יש רישום כניסה ללא רישום יציאה, נעדכן את שעת היציאה
      todayAttendance.checkOutTime = get24HourTime(currentTime);
    } else if (!todayAttendance) {
      // אם אין רישום כלל לאותו היום, ניצור רישום חדש של כניסה
      patient.attendance.push({
        date: currentTime,
        checkInTime: get24HourTime(currentTime),
        checkOutTime: null
      });
    } else {
      // אם יש כבר גם שעת כניסה וגם שעת יציאה לאותו היום
      return res.status(400).json({ message: 'Attendance already complete for today' });
    }

    await patient.save();
    res.status(200).json({ message: 'Attendance updated successfully', patient });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// add new record attendance from AttendanceManagement http://10.10.0.10:500/api/attendance/${selectedPatientId}/attendance-manual work !
router.post('/:patientId/attendance-manual', async (req, res) => {
  const { patientId } = req.params;
  const { date, checkInTime, checkOutTime } = req.body;
 console.log("was fixing !");

  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.attendance.push({ date, checkInTime, checkOutTime });
    await patient.save();

    res.status(201).json({ message: 'Attendance record added manually', attendance: patient.attendance });
  } catch (error) {
    console.error('Error adding manual attendance record:', error);
    res.status(500).json({ message: 'Error adding manual attendance record' });
  }
});



// update the score from AttendanceManagement work  http://10.10.0.10:500/api/attendance/update-scorev
router.put('/update-score', async (req, res) => {
  const { patientId, attendanceId, score } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ message: 'Invalid attendanceId format' });
    }

    const attendanceObjectId = new mongoose.Types.ObjectId(attendanceId);

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



//delete attendance record from AttendanceManagement http://10.10.0.10:500/api/attendance/${selectedPatientId}/attendance-delete/${isoDate} work
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
