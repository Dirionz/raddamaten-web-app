const Order = require('../models/Order');

exports.removeOldOrders = (req, res) => {
    var date = new Date();
    date.setDate(date.getDate() - 2); // two days old

    Order.remove({$and: [
        {isCheckedout: false},
        {updatedAt: {$lte: date}}
        ]}, (err) => {
        if (err) {
            console.log('There was an error when removeOldOrders'+err.message)
        } else {
            console.log('Successfully cleaned old orders (Not checkedout)')
        }
    });
}

// Where is checkedOUt without email, remove one month old?