const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email: String,
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isCheckedout: { type: Boolean, default: false },
    price: Number

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Getter
orderSchema.path('price').get(function(num) {
  return parseFloat(Math.round(num) / 100).toFixed(2);
});

// Setter
orderSchema.path('price').set(function(num) {
  return num * 100;
});

module.exports = Order;