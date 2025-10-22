const express = require('express');
const { body, validationResult } = require('express-validator');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/crops
// @desc    Get all crops
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const crops = await Crop.find({ isActive: true }).sort({ cropName: 1 });
    res.json(crops);
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/crops
// @desc    Create new crop
// @access  Private
router.post('/', [
  auth,
  body('cropName').notEmpty().withMessage('Crop name is required'),
  body('unit').isIn(['kg', 'quintal', 'ton', 'bag']).withMessage('Invalid unit'),
  body('marketRate').isNumeric().withMessage('Market rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropName, unit, description, marketRate } = req.body;

    // Check if crop already exists
    const existingCrop = await Crop.findOne({ cropName: cropName.toUpperCase() });
    if (existingCrop) {
      return res.status(400).json({ message: 'Crop already exists' });
    }

    const crop = new Crop({
      cropName: cropName.toUpperCase(),
      unit,
      description,
      marketRate
    });

    await crop.save();
    res.status(201).json(crop);
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop
// @access  Private
router.put('/:id', [
  auth,
  body('cropName').optional().notEmpty().withMessage('Crop name cannot be empty'),
  body('unit').optional().isIn(['kg', 'quintal', 'ton', 'bag']).withMessage('Invalid unit'),
  body('marketRate').optional().isNumeric().withMessage('Market rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropName, unit, description, marketRate } = req.body;
    const updateData = {};

    if (cropName) updateData.cropName = cropName.toUpperCase();
    if (unit) updateData.unit = unit;
    if (description !== undefined) updateData.description = description;
    if (marketRate !== undefined) updateData.marketRate = marketRate;

    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json(crop);
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete crop (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
