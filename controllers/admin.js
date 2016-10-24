const crypto = require('crypto');
const async = require('async');
const Invite = require('../models/Invite');

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
  res.render('admin/invite', { // TOOD: Load invitations
    title: 'Admin invite'
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
                req.flash('success', { msg: 'Success! Invite has been created.' });
                done(err);
            });
        }
    ], (err) => {
        if (err) { 
            req.flash('errors', { msg: err.message });
         }
        res.redirect('/admin/invite'); 
    });
};

/**
 * POST /admin/invite/delete/5
 * Admin invite create.
 */
exports.deleteInvite = (req, res) => {

    return res.redirect('/admin/invite'); // TODO: Delete invite
};