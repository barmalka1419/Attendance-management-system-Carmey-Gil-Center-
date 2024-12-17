const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // מזהה מותאם אישית וייחודי
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  groupId: { type: String, required: true },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
  attendance: [
    {
      date: { type: Date, default: Date.now },
      checkInTime: { type: String },
      checkOutTime: { type: String },
      score: { type: Number, default: null }, // שדה חדש לציון

    },
  ],
});

module.exports = mongoose.model('Patient', patientSchema);
