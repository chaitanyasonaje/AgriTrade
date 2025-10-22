const StockLog = require('../models/StockLog');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');

const calculateStock = async (cropId, date = new Date()) => {
  try {
    // Get the latest stock log for this crop
    const latestStockLog = await StockLog.findOne({ crop: cropId })
      .sort({ date: -1 });

    // Get purchases and sales for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [purchases, sales] = await Promise.all([
      Purchase.find({
        crop: cropId,
        purchaseDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      Sale.find({
        crop: cropId,
        saleDate: { $gte: startOfDay, $lte: endOfDay }
      })
    ]);

    // Calculate totals
    const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    
    // Calculate average rates
    const avgBuyingRate = purchases.length > 0 
      ? purchases.reduce((sum, p) => sum + p.rate, 0) / purchases.length 
      : 0;
    
    const avgSellingRate = sales.length > 0 
      ? sales.reduce((sum, s) => sum + s.rate, 0) / sales.length 
      : 0;

    // Calculate opening stock (from previous day's closing stock)
    const openingStock = latestStockLog ? latestStockLog.closingStock : 0;
    const closingStock = openingStock + totalPurchased - totalSold;

    // Create or update stock log
    const stockLog = await StockLog.findOneAndUpdate(
      { crop: cropId, date: { $gte: startOfDay, $lte: endOfDay } },
      {
        crop: cropId,
        date: date,
        openingStock,
        purchased: totalPurchased,
        sold: totalSold,
        closingStock,
        avgBuyingRate,
        avgSellingRate
      },
      { upsert: true, new: true }
    );

    return stockLog;
  } catch (error) {
    console.error('Error calculating stock:', error);
    throw error;
  }
};

const updateStockAfterTransaction = async (cropId, transactionType, quantity, rate) => {
  try {
    const today = new Date();
    const stockLog = await calculateStock(cropId, today);
    
    // Update average rates if needed
    if (transactionType === 'purchase') {
      const purchases = await Purchase.find({
        crop: cropId,
        purchaseDate: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
      });
      
      if (purchases.length > 0) {
        const avgRate = purchases.reduce((sum, p) => sum + p.rate, 0) / purchases.length;
        await StockLog.findByIdAndUpdate(stockLog._id, { avgBuyingRate: avgRate });
      }
    } else if (transactionType === 'sale') {
      const sales = await Sale.find({
        crop: cropId,
        saleDate: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
      });
      
      if (sales.length > 0) {
        const avgRate = sales.reduce((sum, s) => sum + s.rate, 0) / sales.length;
        await StockLog.findByIdAndUpdate(stockLog._id, { avgSellingRate: avgRate });
      }
    }

    return stockLog;
  } catch (error) {
    console.error('Error updating stock after transaction:', error);
    throw error;
  }
};

module.exports = {
  calculateStock,
  updateStockAfterTransaction
};
