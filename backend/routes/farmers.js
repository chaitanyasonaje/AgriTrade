const express = require('express');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/farmers
// @desc    Get all farmers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const farmers = await Farmer.find({ isActive: true }).sort({ name: 1 });
    res.json(farmers);
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/farmers/:id
// @desc    Get single farmer with purchases
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const purchases = await Purchase.find({ farmer: req.params.id })
      .populate('crop', 'cropName unit')
      .sort({ purchaseDate: -1 });

    res.json({
      farmer,
      purchases
    });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/farmers
// @desc    Create new farmer
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Farmer name is required'),
  body('village').notEmpty().withMessage('Village is required'),
  body('contact').matches(/^[0-9]{10}$/).withMessage('Contact must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, village, contact, alternateContact, address, notes } = req.body;

    const farmer = new Farmer({
      name,
      village,
      contact,
      alternateContact,
      address,
      notes
    });

    await farmer.save();
    res.status(201).json(farmer);
  } catch (error) {
    console.error('Create farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/farmers/:id
// @desc    Update farmer
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Farmer name cannot be empty'),
  body('contact').optional().matches(/^[0-9]{10}$/).withMessage('Contact must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, village, contact, alternateContact, address, notes } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (village) updateData.village = village;
    if (contact) updateData.contact = contact;
    if (alternateContact !== undefined) updateData.alternateContact = alternateContact;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;

    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.json(farmer);
  } catch (error) {
    console.error('Update farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/farmers/:id
// @desc    Delete farmer (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
