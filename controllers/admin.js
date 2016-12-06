const crypto = require('crypto');
const async = require('async');
const Invite = require('../models/Invite');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

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
                if (err) return res.status(500).send();
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
            return res.status(500).send();
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