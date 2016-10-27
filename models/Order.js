const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    objectId: String,
    email: String,
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isCheckedout: { type: Boolean, default: false },
    price: Number

}, { timestamps: true });

/**
 * OrderObject make searchable id middleware 
 */
orderSchema.pre('save', function(next) {
    const order = this;
    if (!order.isModified('restaurantId')) { return next(); }
    order.objectId = order._id.toString();
    next();
});

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