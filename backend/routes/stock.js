const express = require('express');
const StockLog = require('../models/StockLog');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');
const { calculateStock } = require('../utils/calcStock');

const router = express.Router();

// @route   GET /api/stock
// @desc    Get stock for all crops
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Get all active crops
    const crops = await Crop.find({ isActive: true });
    
    const stockData = await Promise.all(
      crops.map(async (crop) => {
        const stockLog = await calculateStock(crop._id, targetDate);
        return {
          crop: {
            _id: crop._id,
            cropName: crop.cropName,
            unit: crop.unit
          },
          ...stockLog.toObject()
        };
      })
    );

    res.json(stockData);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stock/:cropId
// @desc    Get stock for specific crop
// @access  Private
router.get('/:cropId', auth, async (req, res) => {
  try {
    const { cropId } = req.params;
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Verify crop exists
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const stockLog = await calculateStock(cropId, targetDate);
    
    res.json({
      crop: {
        _id: crop._id,
        cropName: crop.cropName,
        unit: crop.unit
      },
      ...stockLog.toObject()
    });
  } catch (error) {
    console.error('Get crop stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stock/history/:cropId
// @desc    Get stock history for specific crop
// @access  Private
router.get('/history/:cropId', auth, async (req, res) => {
  try {
    const { cropId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    // Verify crop exists
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const filter = { crop: cropId };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const stockHistory = await StockLog.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      crop: {
        _id: crop._id,
        cropName: crop.cropName,
        unit: crop.unit
      },
      history: stockHistory
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
