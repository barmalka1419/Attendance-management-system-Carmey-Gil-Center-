const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, required: true }
}, { collection: 'Guids' });

module.exports = mongoose.model('Guide', guideSchema);
