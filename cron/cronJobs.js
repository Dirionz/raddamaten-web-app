const Order = require('../models/Order');
const Product = require('../models/Product');
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

exports.putProductsBackNotPayed = (req, res) => {
    var date = new Date();
    date.setMinutes(date.getMinutes() - 10) // 10 minutes old

    Order.find({$and: [
        {isCheckedout: true},
        {email: {$exists: false}},
        {updatedAt: {$lte: date}}
        ]}, (err, orders) => {
            if (err) {
                console.log('There was an error when finding removeOldOrders '+err.message)
            } else {

                orders.forEach(function(order){
                    order.products.forEach(function(product) {
                        addBackProduct(product);
                    });
                    order.remove((err) => {
                        if (err) { 
                            console.log('There was an error when removeOldOrders '+err.message)
                        } else {
                            console.log('Successfully cleaned old orders (Checkedout)')
                        }
                    })
                });
            }
    });
}

function addBackProduct(productId) {
    Product.findByIdAndUpdate(productId, { $inc: { quantity: 1 }}, null, (err) => {
        if (err) {
            console.log('There was an error when trying to put back a product '+err.message);
        } else {
            console.log('Successfully put back one product');
        }
    })
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

