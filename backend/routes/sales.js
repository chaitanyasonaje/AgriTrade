const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');
const { updateStockAfterTransaction } = require('../utils/calcStock');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get all sales with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { crop, buyerName, startDate, endDate, paymentStatus } = req.query;
    const filter = {};

    if (crop) filter.crop = crop;
    if (buyerName) filter.buyerName = { $regex: buyerName, $options: 'i' };
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    const sales = await Sale.find(filter)
      .populate('crop', 'cropName unit')
      .populate('createdBy', 'username')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('crop', 'cropName unit')
      .populate('createdBy', 'username');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', [
  auth,
  body('crop').isMongoId().withMessage('Valid crop ID is required'),
  body('buyerName').notEmpty().withMessage('Buyer name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('rate').isNumeric().withMessage('Rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { crop, buyerName, vehicleNumber, quantity, rate, paymentStatus, paymentDate, notes, saleDate } = req.body;

    // Verify crop exists
    const cropExists = await Crop.findById(crop);
    if (!cropExists) {
      return res.status(400).json({ message: 'Crop not found' });
    }

    const sale = new Sale({
      crop,
      buyerName,
      vehicleNumber,
      quantity,
      rate,
      paymentStatus: paymentStatus || 'Pending',
      paymentDate,
      notes,
      saleDate: saleDate || new Date(),
      createdBy: req.user._id
    });

    await sale.save();

    // Update stock
    await updateStockAfterTransaction(crop, 'sale', quantity, rate);

    // Populate the response
    await sale.populate([
      { path: 'crop', select: 'cropName unit' },
      { path: 'createdBy', select: 'username' }
    ]);

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
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

    const { buyerName, vehicleNumber, quantity, rate, paymentStatus, paymentDate, notes } = req.body;
    const updateData = {};

    if (buyerName) updateData.buyerName = buyerName;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (rate !== undefined) updateData.rate = rate;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate;
    if (notes !== undefined) updateData.notes = notes;

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'crop', select: 'cropName unit' },
      { path: 'createdBy', select: 'username' }
    ]);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Update stock if quantity or rate changed
    if (quantity !== undefined || rate !== undefined) {
      await updateStockAfterTransaction(sale.crop._id, 'sale', sale.quantity, sale.rate);
    }

    res.json(sale);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Sale.findByIdAndDelete(req.params.id);

    // Update stock (add back the deleted sale)
    await updateStockAfterTransaction(sale.crop, 'sale', -sale.quantity, sale.rate);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
