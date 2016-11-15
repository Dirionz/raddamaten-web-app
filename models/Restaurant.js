const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: String,
    aboutUs: String,
    website: String,
    pictureURL: String,
    street: String,
    postalCode: String,
    city: String,
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;