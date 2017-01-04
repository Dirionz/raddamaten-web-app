const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
    number: String,
    isVerified: { type: Boolean, default: false },
    objectId: String,

}, { timestamps: true });

/**
 * Make searchable id middleware 
 */
phoneNumberSchema.pre('save', function(next) {
    const phoneNumber = this;
    if (!phoneNumber.isModified('number')) { return next(); }
    phoneNumber.objectId = phoneNumber._id.toString();
    next();
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

module.exports = PhoneNumber;