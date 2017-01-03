const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
    number: String

}, { timestamps: true });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

module.exports = PhoneNumber;