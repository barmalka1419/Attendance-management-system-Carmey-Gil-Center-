const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // ייבוא nodemailer לשליחת אימיילים
const guidesRouter = require('./routes/guides');
const Guide = require('./models/Guid');
const attendanceRouter = require('./routes/attendance');
const Patient = require('./models/Patient');
const bcrypt = require('bcrypt');
const recipientsRouter = require('./routes/recipients'); // ייבוא של הנתיב החדש
const reportRoutes = require('./routes/reportRoutes'); // הייבוא של ה-route שיצרנו


const app = express();
app.use(express.json());

// הפעלת CORS לכל הבקשות
app.use(cors({
  origin: '*',
}));


app.use(cors());

// חיבור ל-MongoDB
mongoose.connect('mongodb+srv://barmalka1419:CarmiGil123@carmigil.lpafd.mongodb.net/CarmiGil?retryWrites=true&w=majority&appName=CarmiGil', {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

  
  



// הגדרת הנתיב למדריכים

app.use('/api/guides', guidesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/patients', require('./routes/recipients')); // ה
app.use('/api/recipients', recipientsRouter);
app.use('/api/reports', reportRoutes);



// from PatientSelectionPage
app.post('/api/sendEmail', (req, res) => {
  const { patientName, patientId, emotion } = req.body;

  // הגדרות לשליחת המייל עם Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail', // שירות ה-Gmail
    auth: {
      user: 'barmalka1419@gmail.com', // הכנס כאן את כתובת ה-Gmail שלך
      pass: 'zlxxfjowctpmzfay', // סיסמת האפליקציה שנוצרה
    },
  });

  const mailOptions = {
    from: 'barmalka1419@gmail.com', // כתובת השולח (Gmail שלך)
    to: 'barmalka1419@gmail.com', // כתובת הנמען
    subject: 'דיווח על מצב חשוד',
    text: `הודעה זו נשלחה בעקבות בחירת אימוג׳י חשוד על ידי המטופל ${patientName} (ID: ${patientId}). רגש שנבחר: ${emotion}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.send('Email sent successfully');
    }
  });
});



const port = 500;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});