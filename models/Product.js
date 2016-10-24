const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    pictureURL: String,
    price: Number,
    quantity: Number,
    startdate: { type: Date, default: '2000-10-10T08:00' },
    enddate: { type: Date, default: '2000-10-10T09:00' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Getter
productSchema.path('price').get(function(num) {
  return parseFloat(Math.round(num) / 100).toFixed(2);
});

// Setter
productSchema.path('price').set(function(num) {
  return num * 100;
});

module.exports = Product;