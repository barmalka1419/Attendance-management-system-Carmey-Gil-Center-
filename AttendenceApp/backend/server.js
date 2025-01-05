const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');  // Importing nodemailer for sending emails
const guidesRouter = require('./routes/guides'); // Router for guide-related API endpoints
const attendanceRouter = require('./routes/attendance'); // Router for attendance-related API endpoints
const recipientsRouter = require('./routes/recipients');  // Router for recipients-related API endpoints
const reportRoutes = require('./routes/reportRoutes'); // Router for report-related API endpoints


const app = express();
app.use(express.json()); // Middleware for parsing JSON request bodies

app.use(cors({
  origin: '*', // Allowing all origins for cross-origin requests
}));


app.use(cors());


mongoose.connect('mongodb+srv://barmalka1419:CarmiGil123@carmigil.lpafd.mongodb.net/CarmiGil?retryWrites=true&w=majority&appName=CarmiGil', {
  useNewUrlParser: true, // Use the new URL string parser
  useUnifiedTopology: true  // Opt-in to the new connection management engine
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

  
app.use('/api/guides', guidesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/patients', require('./routes/recipients')); // ה
app.use('/api/recipients', recipientsRouter);
app.use('/api/reports', reportRoutes);



// Email sending endpoint used in PatientSelectionPage
app.post('/api/sendEmail', (req, res) => {
  const { patientName, patientId, emotion } = req.body; // Extracting patient data and emotion from request body

  // Configuring the email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Email service provider
    auth: {
      user: 'barmalka1419@gmail.com',  // Sender email address
      pass: 'zlxxfjowctpmzfay',  // App-specific password for Gmail
    },
  });
 // Email details
  const mailOptions = {
    from: 'barmalka1419@gmail.com', // Sender email
    to: 'barmalka1419@gmail.com',  // report emotion mail
    subject: 'דיווח על מצב רגשי חשוד',
    text: `
        הודעה זו נשלחה בעקבות בחירת אימוג'י חשוד על ידי המטופל
        שם: ${patientName}
        תעודת זהות: ${patientId}
        הרגש שנבחר: ${emotion}
    `,    
  };
  
  // Sending the email
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



const port = 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});