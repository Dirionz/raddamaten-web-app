const crypto = require('crypto');
const async = require('async');
const Invite = require('../models/Invite');
const Restaurant = require('../models/Restaurant');

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
            title: 'Admin invite',
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
    if ((searchString && searchString.length < 4) || (search_param && !searchString)) {
        req.flash('errors', {msg: "Måste vara minst 4 tecken"});
        return res.redirect('/admin/restaurants');
    }

    if (search_param == "Name") {
        Restaurant.find({$and: [
            {name: new RegExp(searchString, "i")}
        ]}, null, {sort: {updatedAt: -1}}, (err, restaurants) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect('/admin');
            } else {
                return res.render('admin/restaurantsPage', { 
                    title: 'Admin restaurants',
                    restaurants: restaurants,
                    search_param: search_param,
                });
            }
        });
    }
    else {
        Restaurant.find({}, (err, restaurants) => { // TODO: Prob need to limit this in the future
            if (err) {
                req.flash('errors', err);
            }
            return res.render('admin/restaurantsPage', { 
                title: 'Admin restaurants',
                restaurants: restaurants,
                search_param: "Name",
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