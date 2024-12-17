const express = require('express');
const router = express.Router();
const Guide = require('../models/Guid');
const Patient = require('../models/Patient');

//give all the guids in the system form GuideSelectionPage work
router.get('/allguides', async (req, res) => {
  try {
    const guides = await Guide.find(); // שליפת כל המדריכים
    res.json(guides);
  } catch (err) {
    console.error('Error fetching guides:', err);
    res.status(500).json({ message: err.message });
  }
});


// delete guide by id from DeleteGuidePage http://localhost:500/api/guides/${selectedGuideId} work
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGuide = await Guide.findByIdAndDelete(id);

    if (!deletedGuide) {
      return res.status(404).json({ message: 'המדריך לא נמצא' });
    }

    res.status(200).json({ message: 'המדריך נמחק בהצלחה', guide: deletedGuide });
  } catch (error) {
    console.error('Error deleting guide:', error);
    res.status(500).json({ message: 'שגיאה במחיקת המדריך', error: error.message });
  }
});


// adding new guide from addNewGuide http://localhost:500/api/guides/addNewGuide work !
router.post('/addNewGuide', async (req, res) => {
  const { id, name, email, password, imageUrl } = req.body;

  try {
    const newGuide = new Guide({ id, name, email, password, imageUrl });
    const savedGuide = await newGuide.save();
    res.status(201).json({ message: 'מדריך נוסף בהצלחה!', guide: savedGuide });
  } catch (error) {
    console.error('Error adding guide:', error);
    res.status(500).json({ message: 'שגיאה בהוספת מדריך', error: error.message });
  }
});


// updating guid from EditGuidePage http://localhost:500/api/guides/${selectedGuide._id} work !
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, imageUrl } = req.body;

    // עדכון המדריך במסד הנתונים
    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      { name, email, password, imageUrl },
      { new: true, runValidators: true } // החזרה של המדריך המעודכן ובדיקת ולידציה
    );

    if (!updatedGuide) {
      return res.status(404).json({ message: 'המדריך לא נמצא' });
    }

    res.status(200).json(updatedGuide);
  } catch (error) {
    console.error('Error updating guide:', error);
    res.status(500).json({ message: 'שגיאה בעדכון המדריך', error: error.message });
  }
});


// out all the patients that connenting to specific guid id from PatientSelectionPage work 

router.get('/:guideId/patients', async (req, res) => {
  const { guideId } = req.params;
  try {
    const patients = await Patient.find({ guideId }); // חיפוש כל המטופלים לפי guideId
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients for guide:', error);
    res.status(500).json({ message: error.message });
  }
});




// user login work !
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const guide = await Guide.findOne({ email: email, password: password });

    if (!guide) {
      return res.status(404).json({ message: 'מדריך לא נמצא במערכת.' });
    }

    // מדריך נמצא
    res.status(200).json({
      message: 'התחברות בוצעה בהצלחה',
      guide,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'שגיאה בשרת.' });
  }
});




module.exports = router;
