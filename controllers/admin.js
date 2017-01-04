const crypto = require('crypto');
const async = require('async');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const Invite = require('../models/Invite');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const PhoneNumber = require('../models/PhoneNumber');

var json2csv = require('json2csv');

/**
 * GET /admin
 * Admin index page.
 */
exports.getIndex = (req, res) => {
  res.render('admin/index', {
    title: 'Admin'
  });
};

/**
 * GET /admin/invite
 * Admin invite page.
 */
exports.getInvite = (req, res) => {
    Invite.find({}, (err, invitations) => {
        if (err) {
            req.flash('errors', err);
        }
        return res.render('admin/invite', { 
            title: 'Admin inbjudan',
            invitations: invitations,
            host: req.headers.host
        });
    });
};

/**
 * POST /admin/invite
 * Admin invite create.
 */
exports.postInvite = (req, res) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            var invite = Invite({
                token: token
            });

            invite.save((err) => {
                if (err) { return done(err); };
                req.flash('success', { msg: 'Inbjudan skapad.' });
                done(err);
            });
        }
    ], (err) => {
        if (err) { 
            req.flash('errors', err);
         }
        res.redirect('/admin/invite'); 
    });
};

/**
 * POST /admin/invite/delete/5
 * Admin invite create.
 */
exports.deleteInvite = (req, res) => {
    const inviteId = req.params.inviteId;

    Invite.findById(inviteId).remove((err, invite) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/admin/invite');
        } else {
            req.flash('success', { msg: 'Ibjudan borttagen.' });
            return res.redirect('/admin/invite');
        }
    });
};


/**
 * GET /admin/restaurants
 * Admin restaurants page.
 */
exports.getRestaurants = (req, res) => {
    var search_param = req.query.search_param;
    const searchString = req.query.q;
    const limit = parseInt(req.query.limit) || 16;
    if ((searchString && searchString.length < 4) || (search_param && !searchString)) {
        req.flash('errors', {msg: "Måste vara minst 4 tecken"});
        return res.redirect('/admin/restaurants');
    }

    if (search_param == "Name") {
        Restaurant.find({$and: [
            {name: new RegExp(searchString, "i")}
        ]}, null, {limit: limit, sort: {updatedAt: -1}}, (err, restaurants) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect('/admin');
            } else {
                return res.render('admin/restaurantsPage', { 
                    title: 'Admin restauranger',
                    restaurants: restaurants,
                    search_param: search_param,
                });
            }
        });
    }
    else {
        Restaurant.find({},
        null, {limit: limit, sort: {updatedAt: -1}}, (err, restaurants) => {
            if (err) {
                req.flash('errors', err);
            }
            return res.render('admin/restaurantsPage', { 
                title: 'Admin restauranger',
                restaurants: restaurants,
                search_param: "Name",
            });
        });
    }

};

/**
 * GET /admin/restaurants/loadmore
 * Get more restaurants, this function should be called by ajax or similar
 */
exports.getMoreRestaurants = (req, res) => {
    var search_param = req.query.search_param;
    const searchString = req.query.q;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 16;
    if ((searchString && searchString.length < 4) || (search_param && !searchString)) {
        req.flash('errors', {msg: "Måste vara minst 4 tecken"});
        return res.redirect('/admin/restaurants');
    }

    if (search_param == "Name") {
        Restaurant.find({$and: [
            {name: new RegExp(searchString, "i")}
        ]}, null, {limit: limit, skip: skip, sort: {updatedAt: -1}}, (err, restaurants) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect('/admin');
            } else {
                return res.render('admin/restaurants', { 
                    restaurants: restaurants
                });
            }
        });
    }
    else {
        Restaurant.find({}, 
        null, {limit: limit, skip: skip, sort: {updatedAt: -1}}, (err, restaurants) => {
            if (err) {
                req.flash('errors', err);
            }
            return res.render('admin/restaurants', { 
                restaurants: restaurants
            });
        });
    }

};

/**
 * POST /admin/restaurants
 * Admin restaurants page.
 */
exports.postPretendRestaurant = (req, res) => {
    const restaurantId = req.body.restaurantId;
    const user = req.user;

    user.restaurantId = restaurantId;
    user.save((err) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/admin/restaurants');
        } else {
            return res.redirect('/admin/restaurants');
        }
    });
};


/**
 * GET /admin/export/orders
 * Export all orders to csv
 */
exports.getExportOrders = (req, res) => {
    return res.render('admin/ordersexport', {
        date: getLocalISOString(new Date()).slice(0, 16).replace('T', ' ') // Date today
    });
}

/**
 * POST /admin/export/orders
 * Export all orders to csv
 */
exports.exportOrders = (req, res) => {
    var startDate = req.body.startdate;
    var endDate = req.body.enddate;

    if (!startDate || !endDate) {
        req.flash('errors', {msg: 'Felaktig request'});
        return res.render('admin/ordersexport', {
            date: getLocalISOString(new Date()).slice(0, 16).replace('T', ' ') // Date today
        })
    }
    if (startDate >= endDate) {
        req.flash('errors', {msg: '"Från" kan inte vara större än eller lika med "Till"'});
        return res.render('admin/ordersexport', {
            date: getLocalISOString(new Date()).slice(0, 16).replace('T', ' ') // Date today
        })
    }

    async.waterfall([
        function(done) {
            async.parallel({
                restaurants: function(done) {
                    Restaurant.find({},
                    null, {sort: {updatedAt: -1}}, (err, restaurants) => {
                        if (err) {
                            done(err);
                        } else {
                            done(null, restaurants);
                        }
                    });
                },
                orders: function(done) {
                    Order.find({$and: [ 
                        { email: {$exists: true}},
                        { createdAt: {$gte: new Date(startDate)} },
                        { createdAt: {$lte: new Date(endDate)} }
                    ]},
                    null, {sort: {updatedAt: -1}}, (err, orders) => {
                        if (err) {
                            done(err);
                        } else {
                            done(null, orders);
                        }
                    });
                }
            }, function(err, result) {
                if (err) {
                    req.flash('errors', {msg: 'Något gick fel! (500)'});
                    return res.render('admin/ordersexport', {
                        date: getLocalISOString(new Date()).slice(0, 16).replace('T', ' ') // Date today
                    })
                }
                done(null, result.orders, result.restaurants);
            });
        },
        function(orders, restaurants, done) {
            var data = addRestaurantNameToOrders(orders, restaurants);
            done(null, data);
        }, 
        function(data, done) {
            // TO csv
            var fields = ['objectId', 'email', 'price', 'date', 'restaurantName'];
            var fieldNames = ['ID', 'Email', 'Pris SEK', 'Datum', 'Restaurang Namn'];
            json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function(err, csv) {
                if (err) done(err);
                else done(null, csv);
            });
        }

    ], function(err, csv) {
        if (err) {
            req.flash('errors', {msg: 'Något gick fel! (500)'});
            return res.render('admin/ordersexport', {
                date: getLocalISOString(new Date()).slice(0, 16).replace('T', ' ') // Date today
            })
        }
        res.setHeader('Content-disposition', 'attachment; filename=export.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    });

};


function addRestaurantNameToOrders(orders, restaurants) {
    var rows = [];
    for(i in orders) {
        var row = {
            objectId: orders[i].objectId,
            email: orders[i].email,
            price: orders[i].price,
            date: orders[i].createdAt,
            restaurantName: restaurants.find( x => x._id.toString() == orders[i].restaurantId.toString() ).name
        }
        rows.push(row);
    }
    return rows.sort(function(a, b) {
        return a.restaurantName.localeCompare(b.restaurantName);
    });
}

function getLocalISOString(date) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return localISOTime = (new Date(date - tzoffset)).toISOString().slice(0,-1);
}

/**
 * GET /admin/sms/new
 * Send out sms
 */
exports.smsNew = (req, res) => {
    PhoneNumber.count({}, function(err, count){
        if (err) {
            req.flash('errors', err); 
            res.redirect('/admin');
        } else {
            res.render('admin/sendsms', {
                title: 'Admin',
                count: count
            });
        }
    })
}

/**
 * POST /admin/sms/new
 * Send the sms to all phoneNumbers
 */
exports.sendSms = (req, res) => {
    req.assert('text', 'Text cannot be blank.').notEmpty();
    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/admin');
    }

    const message = req.body.text;

    PhoneNumber.find({}, function(err, numbers){
        if (err) {
            req.flash('errors', err); 
            res.redirect('/admin');
        } else {
            const sendSmsTasks = [];
            globalMessage = message;
            for(n in numbers) {
                numbersToSend.push(numbers[n].number);
                sendSmsTasks.push(sendTwilio);
            }
            async.parallel(sendSmsTasks, function(err, result) {
                if (err) {
                    req.flash('errors', err);
                    return res.redirect('/admin');
                } else {
                    req.flash('success', {msg: 'Meddelande skickat till alla nummer.'});
                    res.render('admin/sendsms', {
                        title: 'Admin',
                        count: numbers.length
                    });
                }
            });
        }
    });
}

var numbersToSend = [];
var globalMessage = '';

function sendTwilio(callback) {
  const details = {
    to: numbersToSend.pop(),
    from: '+13472235148', // Save in config
    body: globalMessage
  };
  twilio.sendMessage(details, (err, responseData) => {
      callback(err);
  });
}