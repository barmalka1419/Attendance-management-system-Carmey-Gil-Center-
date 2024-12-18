const express = require('express');
const router = express.Router();
const Guide = require('../models/Guid');
const Patient = require('../models/Patient');

// Endpoint to fetch all guides in the system
// URL: /api/guides/allguides
// Used in GuideSelectionPage
router.get('/allguides', async (req, res) => {
  try {
    const guides = await Guide.find(); // שליפת כל המדריכים
    res.json(guides);
  } catch (err) {
    console.error('Error fetching guides:', err);
    res.status(500).json({ message: err.message });
  }
});


// Endpoint to delete a guide by ID
// URL: /api/guides/:id
// Used in DeleteGuidePage
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

// Endpoint to add a new guide
// URL: /api/guides/addNewGuide
// Used in AddNewGuidePage
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


// Endpoint to update guide details
// URL: /api/guides/:id
// Used in EditGuidePage
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, imageUrl } = req.body;

    // Update the guide details in the database
    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      { name, email, password, imageUrl },
      { new: true, runValidators: true } //Return the updated guide and validate the input
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


// Endpoint to fetch all patients associated with a specific guide
// URL: /api/guides/:guideId/patients
// Used in PatientSelectionPage
router.get('/:guideId/patients', async (req, res) => {
  const { guideId } = req.params;
  try {
    const patients = await Patient.find({ guideId }); // Retrieve patients linked to the specified guide
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients for guide:', error);
    res.status(500).json({ message: error.message });
  }
});




// Endpoint for user login
// URL: /api/guides/login
// Used for guide authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const guide = await Guide.findOne({ email: email, password: password });

    if (!guide) {
      return res.status(404).json({ message: 'מדריך לא נמצא במערכת.' });
    }

   // Successful login
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
