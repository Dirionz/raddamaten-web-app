const Order = require('../models/Order');
const PhoneNumber = require('../models/PhoneNumber');

exports.removeOldOrders = (req, res) => {
    var date = new Date();
    date.setDate(date.getDate() - 2); // two days old

    Order.remove({$and: [
        {isCheckedout: false},
        {updatedAt: {$lte: date}}
        ]}, (err) => {
            if (err) {
                console.log('There was an error when removeOldOrders '+err.message)
            } else {
                console.log('Successfully cleaned old orders (Not checkedout)')
            }
    });
}

exports.removeOldOrdersCheckedoutNotPayed = (req, res) => {
    var date = new Date();
    date.setDate(date.getDate() - 15); // fifhteen days old

    Order.remove({$and: [
        {isCheckedout: true},
        {email: {$exists: false}},
        {updatedAt: {$lte: date}}
        ]}, (err) => {
            if (err) {
                console.log('There was an error when removeOldOrders '+err.message)
            } else {
                console.log('Successfully cleaned old orders (Checkedout)')
            }
    });
}

exports.removePhoneNumbersNotVerified = (req, res) => {
    var date = new Date();
    date.setDate(date.getDate() - 2); // two days old

    PhoneNumber.remove({$and: [
        {isVerified: false},
        {createdAt: {$lte: date}}
        ]}, (err) => {
            if (err) {
                console.log('There was an error when removePhoneNumbersNotVerified '+err.message)
            } else {
                console.log('Successfully cleaned unVerified PhoneNumbers')
            }
    });
}

