const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Invite = require('../models/Invite');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Logga in'
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('email', 'Email är inte giltlig').isEmail();
    req.assert('password', 'Lösenord kan inte lämnas tomt').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Lyckades! Du är nu inloggad.' });
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Skapa konto'
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
};

/**
 * GET /signup/restaurant/5
 * Signup page for restaurant.
 */
exports.getSignupRestaurant = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    Invite.findOne({token: req.params.token}, (err, invite) => {
        if (err || !invite) {
            return res.redirect('/');
        } else {
            res.render('account/signup_restaurant', {
                title: 'Skapa konto'
            });
        }
    });

};

/**
 * POST /signup/restaurant
 * Create a new local account for a restaurant.
 */
exports.postSignupRestaurant = (req, res, next) => {
    req.assert('email', 'Email är inte giltlig').isEmail();
    req.assert('password', 'Lösenordet måste vara minst 4 karaktärer långt').len(4);
    req.assert('confirmPassword', 'Lösenorden matchar inte').equals(req.body.password);
    req.assert('name', 'Namn kan inte vara tomt').notEmpty();
    req.assert('street', 'Gata kan inte vara tomt').notEmpty();
    req.assert('postalcode', 'Postnummer kan inte vara tomt').notEmpty();
    req.assert('city', 'Stad kan inte vara tomt').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
    req.assert('name', 'Namn kan inte vara längre än 50 karaktärer').len(0,50);
    req.assert('aboutUs', 'Om oss kan inte vara längre än 400 karaktärer').len(0,400);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect(req.url);
    }

    const restaurant = new Restaurant({
        name: req.body.name,
        street: req.body.street,
        postalCode: req.body.postalcode,
        city: req.body.city,
    });

    const user = new User({
        email: req.body.email,
        password: req.body.password,
        restaurantId: restaurant._id
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Ett konto med den email addressen finns redan.' });
            return res.redirect(req.url);
        }
        user.save((err) => {
            if (err) { return next(err); }
            restaurant.save((err) => {
                if (err) { return next(err); }

                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/');
                });
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
    res.render('account/profile', {
        title: 'Konto hantering'
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
    req.assert('email', 'Skriv in en giltlig email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', { msg: 'Email adressen är redan kopplad till kontot.' });
                    return res.redirect('/account');
                }
                return next(err);
            }
            req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    req.assert('password', 'Lösenordet måste vara minst 4 karaktärer långt').len(4);
    req.assert('confirmPassword', 'Lösenorden måste vara lika').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Lösenordet har ändrats' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
    User.remove({ _id: req.user.id }, (err) => {
        if (err) { return next(err); }
        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
    const provider = req.params.provider;
    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user[provider] = undefined;
        user.tokens = user.tokens.filter(token => token.kind !== provider);
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('info', { msg: `${provider} account has been unlinked.` });
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash('errors', { msg: 'Länken är felaktig eller har gått ut.' });
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Återställning'
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    req.assert('password', 'Lösenordet måste vara minst 4 karaktärer långt').len(4);
    req.assert('confirm', 'Lösenorden måste vara lika').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    async.waterfall([
        function(done) {
            User
                .findOne({ passwordResetToken: req.params.token })
                .where('passwordResetExpires').gt(Date.now())
                .exec((err, user) => {
                    if (err) { return next(err); }
                    if (!user) {
                        req.flash('errors', { msg: 'Länken är felaktig eller har gått ut.' });
                        return res.redirect('back');
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err) => {
                        if (err) { return next(err); }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        function(user, done) {
            const transporter = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: process.env.MAILGUN_USER,
                    pass: process.env.MAILGUN_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: '"Räddamaten" <account@raddamaten.se>',
                subject: 'Ditt Räddamaten lösenord har ändrats',
                html: `<div style='background: #f2f2f2; text-align:center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif'> \
                        <div style='color: #525252;line-height: 1.5;font-weight:300;font-size: 4em;margin: 1em auto 1em;'> \
                            Hej, \
                        </div> \
                        <div style='color: #999999; line-height: 1.5; font-weight:300; font-size: 2em; margin: 0.5em auto 0.5em'> \
                            <p>Detta är en bekräftelse om att lösenordet har ändrats för ditt konto:</p> \
                            <strong style='word-break: break-all'> ${user.email} </strong> \
                        </div> \
                            <br/> \
                            <br/> \
                            <br/> \
                        </div>`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('success', { msg: 'Ditt lösenord har ändrats' });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Glömt lösenord'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Skriv in en giltlig email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    async.waterfall([
        function(done) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (err) { return done(err); }
                if (!user) {
                    req.flash('errors', { msg: 'Ett konto med denna email adress finns inte' });
                    return res.redirect('/forgot');
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            const transporter = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: process.env.MAILGUN_USER,
                    pass: process.env.MAILGUN_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: '"Räddamaten" <account@raddamaten.se>',
                subject: 'Återställ ditt lösenord på Räddamaten',
                html: `<div style='background: #f2f2f2; text-align:center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif'> \
                        <div style='color: #525252;line-height: 1.5;font-weight:300;font-size: 4em;margin: 1em auto 1em;'> \
                            Hej, \
                        </div> \
                        <div style='color: #999999; line-height: 1.5; font-weight:300; font-size: 2em; margin: 0.5em auto 0.5em'> \
                            <p>Du får detta email för att du (eller någon annan) har begärt återställning av lösenordet för ditt konto. Tryck på följade länk, eller kopiera och klistra in i din webläsare för att slutföra processen:</p> \
                            <strong style='word-break: break-all'> <a style='color: #999999;' href='http://${req.headers.host}/reset/${token}'>http://${req.headers.host}/reset/${token}</a> </strong> \
                                <p> Om du inte begärde denna återställning, ignorera detta mail och ditt lösenord förblir oförändrat. </p> \ 
                        </div> \
                            <br/> \
                            <br/> \
                            <br/> \
                        </div>`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('info', { msg: `Ett email har skickats till ${user.email} med ytterligare instuktioner` });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect('/forgot');
    });
};