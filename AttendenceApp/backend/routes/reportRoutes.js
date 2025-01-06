const express = require('express'); // Import the Express library to create routes and handle HTTP requests.
const router = express.Router();  // Create a new router for handling specific routes.
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
          const attDate = new Date(att.date); // Convert attendance date to a Date object.
          return (
            attDate.getMonth() === new Date(selectedMonth).getMonth() && // Check if the month matches.
            attDate.getFullYear() === new Date(selectedMonth).getFullYear() // Check if the year matches.
          );
        });

// Add attendance data for the patient to the guide's attendance.
        guideAttendance.push({
          patientName: patient.name,
          attendance: patientAttendance,
        });
      }
 // Add the current guide's attendance data to the main array.
      attendanceData.push({
        guideName: guide.name,
        attendance: guideAttendance,
      });
    }

    return attendanceData; // Return the collected attendance data.
  } catch (error) {
    console.error(`Error fetching attendance data: ${error.message}`);
    throw new Error('Failed to fetch attendance data');
  }
};

// Function to generate an Excel report based on attendance data
const generateExcelReport = async (selectedMonth) => {
  const attendanceData = await getAllAttendanceData(selectedMonth); // Fetch attendance data for the selected month.
  const wb = XLSX.utils.book_new(); // Create a new workbook

  attendanceData.forEach((guideData) => {

    // Create a sheet with headers: Date, Patient Names, and Scores
    const wsData = [
      ['תאריך', ...guideData.attendance.flatMap(p => [p.patientName, `ציון עבור ${p.patientName}`])]
    ];

    const daysInMonth = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0).getDate(); // Get the number of days in the selected month by creating a Date object for the last day of the month.

    const wsStyles = {}; // Initialize styles for the worksheet.

      // Populate the worksheet with attendance data for each day of the month.
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth(), day);
      const formattedDate = currentDate.toLocaleDateString('he-IL'); // Format date as DD/MM/YYYY (Hebrew locale).
      const row = [formattedDate]; // Start a new row with the current date.

      guideData.attendance.forEach(patient => {
         // Find attendance data for the current day, if available.
        const attendanceRecord = patient.attendance.find(att => {
          const attDate = new Date(att.date);
          return attDate.getDate() === currentDate.getDate();
        });

        if (attendanceRecord) {
          const checkInTime = attendanceRecord.checkInTime || '--:--'; // Check-in time or placeholder.
          const checkOutTime = attendanceRecord.checkOutTime || '--:--';
          row.push(`נכח : ${checkInTime}-${checkOutTime}`);
          row.push(attendanceRecord.score ?? ''); // Add score or leave blank if not available
        } else {
          row.push('אין נוכחות');
          row.push('');
        }
      });

      wsData.push(row);  // Add the completed row to the worksheet data.

 
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);  // Create worksheet from data.

    // Apply styles to the worksheet
    Object.keys(wsStyles).forEach(cell => {
      if (!ws[cell]) ws[cell] = {}; // Initialize cell if not defined.
      ws[cell].s = wsStyles[cell]; // Apply styles.
    });

    XLSX.utils.book_append_sheet(wb, ws, guideData.guideName); // Add the worksheet to the workbook
  });

  return wb;  // Return the generated workbook.
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
    const { selectedMonth, email } = req.body; // Extract the selected month and email from the request.
    const wb = await generateExcelReport(selectedMonth);

    const filePath = `./attendance-report.xlsx`;
    XLSX.writeFile(wb, filePath); // Write the workbook to a file.

    await sendEmailWithAttachment(filePath, email);

    res.status(200).json({ message: 'הדוח נשלח בהצלחה' });
  } catch (error) {
    console.error('Error generating or sending report:', error);
    res.status(500).send('שגיאה בהפקת הדוח');
  }
});

module.exports = router;
