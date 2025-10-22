const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: [true, 'Crop name is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'quintal', 'ton', 'bag'],
    default: 'kg'
  },
  description: {
    type: String,
    trim: true
  },
  marketRate: {
    type: Number,
    required: [true, 'Market rate is required'],
    min: [0, 'Market rate cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema);
