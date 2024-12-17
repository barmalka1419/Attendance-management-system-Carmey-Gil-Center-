const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const Patient = require('../models/Patient');
const Guide = require('../models/Guid');


// פונקציה שמביאה את נתוני הנוכחות לכל המדריכים
const getAllAttendanceData = async (selectedMonth) => {
  try {
    const guides = await Guide.find();
    const attendanceData = [];

    for (const guide of guides) {
      const patients = await Patient.find({ guideId: guide._id });
      const guideAttendance = [];

      for (const patient of patients) {
        const patientAttendance = patient.attendance.filter(att => {
          const attDate = new Date(att.date);
          return (
            attDate.getMonth() === new Date(selectedMonth).getMonth() &&
            attDate.getFullYear() === new Date(selectedMonth).getFullYear()
          );
        });


        guideAttendance.push({
          patientName: patient.name,
          attendance: patientAttendance,
        });
      }

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

// יצירת דוח אקסל
const generateExcelReport = async (selectedMonth) => {
  const attendanceData = await getAllAttendanceData(selectedMonth);
  const wb = XLSX.utils.book_new();

  attendanceData.forEach((guideData) => {

    // כותרת: תאריך, מטופלים וציון עבור כל מטופל
    const wsData = [
      ['תאריך', ...guideData.attendance.flatMap(p => [p.patientName, `ציון עבור ${p.patientName}`])]
    ];

    const daysInMonth = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0).getDate();
    const wsStyles = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth(), day);
      const formattedDate = currentDate.toLocaleDateString('he-IL');
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
          row.push(attendanceRecord.score ?? ''); // ציון או ריק אם לא קיים
        } else {
          row.push('אין נוכחות');
          row.push('');
        }
      });

      wsData.push(row);

      // עיצוב צבעים
      const dateCell = `A${day + 1}`;
      if (currentDate.getDay() === 5 || currentDate.getDay() === 6) {
        wsStyles[dateCell] = { fill: { fgColor: { rgb: 'FFFF00' } } }; // צהוב
      }

      guideData.attendance.forEach((_, col) => {
        const cell = XLSX.utils.encode_cell({ c: col * 2 + 1, r: day });
        if (row[col * 2 + 1] === 'אין נוכחות') {
          wsStyles[cell] = { fill: { fgColor: { rgb: 'FF0000' } } }; // אדום
        }
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // החלת עיצובים
    Object.keys(wsStyles).forEach(cell => {
      if (!ws[cell]) ws[cell] = {};
      ws[cell].s = wsStyles[cell];
    });

    XLSX.utils.book_append_sheet(wb, ws, guideData.guideName);
  });

  return wb;
};

// שליחת הדוח במייל
const sendEmailWithAttachment = async (filePath, email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'barmalka1419@gmail.com',
      pass: 'zlxxfjowctpmzfay',
    },
  });

  const mailOptions = {
    from: 'barmalka1419@gmail.com',
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

  await transporter.sendMail(mailOptions);
};

// נתיב להפקת הדוח AttendanceReport work
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
