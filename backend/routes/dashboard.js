const express = require('express');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const StockLog = require('../models/StockLog');
const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set date range
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of current month
    const end = endDate ? new Date(endDate) : new Date(); // Today

    // Base filters
    const purchaseFilter = { purchaseDate: { $gte: start, $lte: end } };
    const saleFilter = { saleDate: { $gte: start, $lte: end } };
    const expenseFilter = { date: { $gte: start, $lte: end } };

    // Get aggregated data
    const [
      totalPurchases,
      totalSales,
      totalExpenses,
      cropStats,
      farmerCount,
      cropCount
    ] = await Promise.all([
      // Total purchases
      Purchase.aggregate([
        { $match: purchaseFilter },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalCost: { $sum: '$totalCost' },
            avgRate: { $avg: '$rate' }
          }
        }
      ]),

      // Total sales
      Sale.aggregate([
        { $match: saleFilter },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' },
            avgRate: { $avg: '$rate' }
          }
        }
      ]),

      // Total expenses
      Expense.aggregate([
        { $match: expenseFilter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),

      // Crop-wise statistics
      Purchase.aggregate([
        { $match: purchaseFilter },
        {
          $lookup: {
            from: 'crops',
            localField: 'crop',
            foreignField: '_id',
            as: 'cropInfo'
          }
        },
        { $unwind: '$cropInfo' },
        {
          $group: {
            _id: '$crop',
            cropName: { $first: '$cropInfo.cropName' },
            unit: { $first: '$cropInfo.unit' },
            totalPurchased: { $sum: '$quantity' },
            totalCost: { $sum: '$totalCost' },
            avgBuyingRate: { $avg: '$rate' }
          }
        }
      ]),

      // Farmer count
      Farmer.countDocuments({ isActive: true }),

      // Crop count
      Crop.countDocuments({ isActive: true })
    ]);

    // Get sales data for each crop
    const salesByCrop = await Sale.aggregate([
      { $match: saleFilter },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$crop',
          cropName: { $first: '$cropInfo.cropName' },
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          avgSellingRate: { $avg: '$rate' }
        }
      }
    ]);

    // Combine purchase and sales data
    const cropStatsMap = new Map();
    
    cropStats.forEach(stat => {
      cropStatsMap.set(stat._id.toString(), {
        ...stat,
        totalSold: 0,
        totalRevenue: 0,
        avgSellingRate: 0,
        profit: 0
      });
    });

    salesByCrop.forEach(sale => {
      const existing = cropStatsMap.get(sale._id.toString());
      if (existing) {
        existing.totalSold = sale.totalSold;
        existing.totalRevenue = sale.totalRevenue;
        existing.avgSellingRate = sale.avgSellingRate;
        existing.profit = sale.totalRevenue - existing.totalCost;
      } else {
        cropStatsMap.set(sale._id.toString(), {
          _id: sale._id,
          cropName: sale.cropName,
          unit: 'kg',
          totalPurchased: 0,
          totalCost: 0,
          avgBuyingRate: 0,
          totalSold: sale.totalSold,
          totalRevenue: sale.totalRevenue,
          avgSellingRate: sale.avgSellingRate,
          profit: sale.totalRevenue
        });
      }
    });

    const finalCropStats = Array.from(cropStatsMap.values());

    // Calculate overall profit
    const totalRevenue = totalSales[0]?.totalRevenue || 0;
    const totalCost = totalPurchases[0]?.totalCost || 0;
    const totalExpenseAmount = totalExpenses[0]?.totalAmount || 0;
    const netProfit = totalRevenue - totalCost - totalExpenseAmount;

    res.json({
      overview: {
        totalPurchased: totalPurchases[0]?.totalQuantity || 0,
        totalSold: totalSales[0]?.totalQuantity || 0,
        totalCost: totalCost,
        totalRevenue: totalRevenue,
        totalExpenses: totalExpenseAmount,
        netProfit: netProfit,
        farmerCount,
        cropCount
      },
      cropStats: finalCropStats,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get chart data for dashboard
// @access  Private
router.get('/charts', auth, async (req, res) => {
  try {
    const { startDate, endDate, chartType = 'daily' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    let chartData = [];

    if (chartType === 'daily') {
      // Daily purchases vs sales
      const dailyData = await Promise.all([
        Purchase.aggregate([
          { $match: { purchaseDate: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' } },
              purchases: { $sum: '$quantity' },
              cost: { $sum: '$totalCost' }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Sale.aggregate([
          { $match: { saleDate: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
              sales: { $sum: '$quantity' },
              revenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      // Combine daily data
      const dailyMap = new Map();
      
      dailyData[0].forEach(item => {
        dailyMap.set(item._id, {
          date: item._id,
          purchases: item.purchases,
          sales: 0,
          cost: item.cost,
          revenue: 0,
          profit: -item.cost
        });
      });

      dailyData[1].forEach(item => {
        const existing = dailyMap.get(item._id);
        if (existing) {
          existing.sales = item.sales;
          existing.revenue = item.revenue;
          existing.profit = item.revenue - existing.cost;
        } else {
          dailyMap.set(item._id, {
            date: item._id,
            purchases: 0,
            sales: item.sales,
            cost: 0,
            revenue: item.revenue,
            profit: item.revenue
          });
        }
      });

      chartData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    } else if (chartType === 'crop') {
      // Crop-wise data
      chartData = await Purchase.aggregate([
        { $match: { purchaseDate: { $gte: start, $lte: end } } },
        {
          $lookup: {
            from: 'crops',
            localField: 'crop',
            foreignField: '_id',
            as: 'cropInfo'
          }
        },
        { $unwind: '$cropInfo' },
        {
          $group: {
            _id: '$crop',
            cropName: { $first: '$cropInfo.cropName' },
            totalPurchased: { $sum: '$quantity' },
            totalCost: { $sum: '$totalCost' }
          }
        },
        { $sort: { totalPurchased: -1 } }
      ]);
    }

    res.json({
      chartType,
      data: chartData,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
