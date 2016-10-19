const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email: String,
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;