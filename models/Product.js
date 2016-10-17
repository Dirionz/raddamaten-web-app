const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    pictureURL: String,
    price: Number,
    quantity: Number,
    startdate: { type: Date, default: '12/10/1990' },
    enddate: { type: Date, default: '12/10/1990' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;