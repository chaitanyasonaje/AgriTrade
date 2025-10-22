const express = require('express');
const { body, validationResult } = require('express-validator');
const Purchase = require('../models/Purchase');
const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const { updateStockAfterTransaction } = require('../utils/calcStock');

const router = express.Router();

// @route   GET /api/purchases
// @desc    Get all purchases with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { crop, farmer, startDate, endDate, paymentStatus } = req.query;
    const filter = {};

    if (crop) filter.crop = crop;
    if (farmer) filter.farmer = farmer;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('crop', 'cropName unit')
      .populate('farmer', 'name village contact')
      .populate('createdBy', 'username')
      .sort({ purchaseDate: -1 });

    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/:id
// @desc    Get single purchase
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('crop', 'cropName unit')
      .populate('farmer', 'name village contact')
      .populate('createdBy', 'username');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/purchases
// @desc    Create new purchase
// @access  Private
router.post('/', [
  auth,
  body('crop').isMongoId().withMessage('Valid crop ID is required'),
  body('farmer').isMongoId().withMessage('Valid farmer ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('rate').isNumeric().withMessage('Rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { crop, farmer, quantity, rate, paymentStatus, paymentDate, notes, purchaseDate } = req.body;

    // Verify crop and farmer exist
    const [cropExists, farmerExists] = await Promise.all([
      Crop.findById(crop),
      Farmer.findById(farmer)
    ]);

    if (!cropExists) {
      return res.status(400).json({ message: 'Crop not found' });
    }
    if (!farmerExists) {
      return res.status(400).json({ message: 'Farmer not found' });
    }

    const purchase = new Purchase({
      crop,
      farmer,
      quantity,
      rate,
      paymentStatus: paymentStatus || 'Pending',
      paymentDate,
      notes,
      purchaseDate: purchaseDate || new Date(),
      createdBy: req.user._id
    });

    await purchase.save();

    // Update stock
    await updateStockAfterTransaction(crop, 'purchase', quantity, rate);

    // Populate the response
    await purchase.populate([
      { path: 'crop', select: 'cropName unit' },
      { path: 'farmer', select: 'name village contact' },
      { path: 'createdBy', select: 'username' }
    ]);

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/purchases/:id
// @desc    Update purchase
// @access  Private
router.put('/:id', [
  auth,
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('rate').optional().isNumeric().withMessage('Rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, rate, paymentStatus, paymentDate, notes } = req.body;
    const updateData = {};

    if (quantity !== undefined) updateData.quantity = quantity;
    if (rate !== undefined) updateData.rate = rate;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate;
    if (notes !== undefined) updateData.notes = notes;

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'crop', select: 'cropName unit' },
      { path: 'farmer', select: 'name village contact' },
      { path: 'createdBy', select: 'username' }
    ]);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Update stock if quantity or rate changed
    if (quantity !== undefined || rate !== undefined) {
      await updateStockAfterTransaction(purchase.crop._id, 'purchase', purchase.quantity, purchase.rate);
    }

    res.json(purchase);
  } catch (error) {
    console.error('Update purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    await Purchase.findByIdAndDelete(req.params.id);

    // Update stock (subtract the deleted purchase)
    await updateStockAfterTransaction(purchase.crop, 'purchase', -purchase.quantity, purchase.rate);

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
