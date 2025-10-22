const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Crop is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  openingStock: {
    type: Number,
    required: [true, 'Opening stock is required'],
    min: [0, 'Opening stock cannot be negative']
  },
  purchased: {
    type: Number,
    default: 0,
    min: [0, 'Purchased quantity cannot be negative']
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative']
  },
  closingStock: {
    type: Number,
    required: [true, 'Closing stock is required'],
    min: [0, 'Closing stock cannot be negative']
  },
  avgBuyingRate: {
    type: Number,
    default: 0,
    min: [0, 'Average buying rate cannot be negative']
  },
  avgSellingRate: {
    type: Number,
    default: 0,
    min: [0, 'Average selling rate cannot be negative']
  }
}, {
  timestamps: true
});

// Calculate closing stock before saving
stockLogSchema.pre('save', function(next) {
  this.closingStock = this.openingStock + this.purchased - this.sold;
  next();
});

module.exports = mongoose.model('StockLog', stockLogSchema);
