const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true
  },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  alternateContact: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);
