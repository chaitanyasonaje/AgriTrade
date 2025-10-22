const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Crop is required']
  },
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
saleSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('rate')) {
    this.totalAmount = this.quantity * this.rate;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
