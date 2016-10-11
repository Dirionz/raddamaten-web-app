const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: String,
    aboutUs: String,
    pictureURL: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    street: String,
    postalCode: String,
    city: String,
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;