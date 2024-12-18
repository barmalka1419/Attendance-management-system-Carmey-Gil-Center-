const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');// For sending emails
const XLSX = require('xlsx'); // For creating Excel reports
const Patient = require('../models/Patient'); // Model for service recipients (patients)
const Guide = require('../models/Guid'); // Model for guides


// Function to fetch attendance data for all guides for the selected month
const getAllAttendanceData = async (selectedMonth) => {
  try {
    const guides = await Guide.find(); // Fetch all guides from the database
    const attendanceData = [];

    for (const guide of guides) {
      const patients = await Patient.find({ guideId: guide._id }); // Fetch all patients assigned to the current guide
      const guideAttendance = [];

      for (const patient of patients) {
        // Filter attendance records by the selected month and year
        const patientAttendance = patient.attendance.filter(att => {
          const attDate = new Date(att.date);
          return (
            attDate.getMonth() === new Date(selectedMonth).getMonth() &&
            attDate.getFullYear() === new Date(selectedMonth).getFullYear()
          );
        });

// Add attendance data for the patient
        guideAttendance.push({
          patientName: patient.name,
          attendance: patientAttendance,
        });
      }
// Add attendance data for the guide
      attendanceData.push({
        guideName: guide.name,
        attendance: guideAttendance,
      });
    }

    return attendanceData;
  } catch (error) {
    console.error(`Error fetching attendance data: ${error.message}`);
    throw new Error('Failed to fetch attendance data');
  }
};

// Function to generate an Excel report based on attendance data
const generateExcelReport = async (selectedMonth) => {
  const attendanceData = await getAllAttendanceData(selectedMonth); // Fetch attendance data
  const wb = XLSX.utils.book_new(); // Create a new workbook

  attendanceData.forEach((guideData) => {

    // Create a sheet with headers: Date, Patient Names, and Scores
    const wsData = [
      ['תאריך', ...guideData.attendance.flatMap(p => [p.patientName, `ציון עבור ${p.patientName}`])]
    ];

    const daysInMonth = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0).getDate();
    const wsStyles = {}; // Styles for Excel cells

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth(), day);
      const formattedDate = currentDate.toLocaleDateString('he-IL'); // Format the date for the report
      const row = [formattedDate];

      guideData.attendance.forEach(patient => {
        const attendanceRecord = patient.attendance.find(att => {
          const attDate = new Date(att.date);
          return attDate.getDate() === currentDate.getDate();
        });

        if (attendanceRecord) {
          const checkInTime = attendanceRecord.checkInTime || '--:--';
          const checkOutTime = attendanceRecord.checkOutTime || '--:--';
          row.push(`נכח : ${checkInTime}-${checkOutTime}`);
          row.push(attendanceRecord.score ?? ''); // Add score or leave blank if not available
        } else {
          row.push('אין נוכחות');
          row.push('');
        }
      });

      wsData.push(row);

     // Highlight weekends in yellow
      const dateCell = `A${day + 1}`;
      if (currentDate.getDay() === 5 || currentDate.getDay() === 6) {
        wsStyles[dateCell] = { fill: { fgColor: { rgb: 'FFFF00' } } }; 
      }

      // Highlight missing attendance in red
      guideData.attendance.forEach((_, col) => {
        const cell = XLSX.utils.encode_cell({ c: col * 2 + 1, r: day });
        if (row[col * 2 + 1] === 'אין נוכחות') {
          wsStyles[cell] = { fill: { fgColor: { rgb: 'FF0000' } } }; // אדום
        }
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles to the worksheet
    Object.keys(wsStyles).forEach(cell => {
      if (!ws[cell]) ws[cell] = {};
      ws[cell].s = wsStyles[cell];
    });

    XLSX.utils.book_append_sheet(wb, ws, guideData.guideName); // Add the worksheet to the workbook
  });

  return wb;
};

// Function to send an email with the Excel report as an attachment
const sendEmailWithAttachment = async (filePath, email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail service
    auth: {
      user: 'barmalka1419@gmail.com', // Sender email address
      pass: 'zlxxfjowctpmzfay', // App-specific password
    },
  });

  const mailOptions = { 
    from: 'barmalka1419@gmail.com', // Sender email
    to: email,
    subject: 'דוח נוכחות', 
    text: 'הדוח מצורף כאן.',
    attachments: [
      {
        filename: 'attendance-report.xlsx',
        path: filePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions); // Send the email
};

// Route to generate and send an attendance report
// Endpoint: /api/reports/send-report
// Used in AttendanceReport
router.post('/send-report', async (req, res) => {
  try {
    const { selectedMonth, email } = req.body;
    const wb = await generateExcelReport(selectedMonth);

    const filePath = `./attendance-report.xlsx`;
    XLSX.writeFile(wb, filePath);

    await sendEmailWithAttachment(filePath, email);

    res.status(200).json({ message: 'הדוח נשלח בהצלחה' });
  } catch (error) {
    console.error('Error generating or sending report:', error);
    res.status(500).send('שגיאה בהפקת הדוח');
  }
});

module.exports = router;
