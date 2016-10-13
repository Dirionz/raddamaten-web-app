const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

/**
 * GET /restaurant
 * Restaurant page.
 */
exports.getRestaurant = (req, res) => {
    Restaurant.findOne({ _id: req.user.restaurantId }, (err, restaurant) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/');
        } else {
            res.render('restaurant/restaurant', {
                title: 'Restaurant',
                restaurant: restaurant
            });
        }
    });
};

/**
 * GET /restaurant/addproduct
 * Create product page.
 */
exports.getAddProduct = (req, res) => {
    res.render('restaurant/addproduct', {
        title: 'Add product',
        date: new Date().toISOString().split('T')[0] // Date today
    });
};

/**
 * POST /restaurant/product
 * Create product page.
 */
exports.postAddProduct = (req, res) => {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('price', 'Price cannot be blank').notEmpty();
    req.assert('quantity', 'Quantity cannot be blank').notEmpty();
    req.assert('description', 'Description cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/restaurant/product');
    }

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        pictureURL: ((req.file) ? "/" + req.file.filename : "http://www.alsglobal.com/~/media/Images/Divisions/Life%20Sciences/Food/ALS-Food-Hero.jpg"), // TODO: Set the default img
        price: req.body.price,
        quantity: parseInt(req.body.quantity),
        date: new Date(req.body.date),
        restaurantId: req.user.restaurantId
    });

    product.save((err) => {
        if (err) {
            req.flash('errors', err);
        } else {
            req.flash('success', { msg: 'Product has been added successfully!' });
        }
        return res.redirect('/restaurant/product');
    });

};

/**
 * GET /restaurant/products
 * Products list page.
 */
exports.getProducts = (req, res) => {

    Product.find({restaurantId: req.user.restaurantId}, (err, products) => {
        if (err) {
            //callback function return error
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            //successfully braunch
            res.render('restaurant/products', {
                title: 'Products List',
                products: products
            });
        }
    });
};

/**
 * GET /restaurant/edit
 * Edit Restaurant page.
 */
exports.getEditRestaurant = (req, res) => {
    Restaurant.findOne({ _id: req.user.restaurantId }, (err, restaurant) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/');
        } else {
            res.render('restaurant/editrestaurant', {
                title: 'Edit restaurant',
                restaurant: restaurant
            });
        }
    });
};

/**
 * POST /restaurant/edit
 * Edit Restaurant page.
 */
exports.postEditRestaurant = (req, res) => {
    req.assert('name', 'Name cannot be empty').notEmpty();
    req.assert('street', 'Street cannot be empty').notEmpty();
    req.assert('postalcode', 'postalCode cannot be empty').notEmpty();
    req.assert('city', 'City cannot be empty').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/restaurant/edit');
    }


    Restaurant.findById(req.user.restaurantId, (err, restaurant) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant/edit');
        } else {
            restaurant.name = req.body.name;
            restaurant.aboutUs = req.body.aboutUs || '';
            restaurant.street = req.body.street;
            restaurant.postalcode = req.body.postalcode;
            restaurant.city = req.body.city;

            restaurant.save((err) => {
                if (err) {
                    req.flash('errors', err);
                    return res.redirect('/restaurant/edit');
                } else {
                    req.flash('success', { msg: 'Profile information has been updated.' });
                    return res.redirect('/restaurant');
                }
            });

        }
    });
};

/**
 * POST /restaurant/edit/picture
 * Edit Restaurant page.
 */
exports.postPictureRestaurant = (req, res) => {
    Restaurant.findById(req.user.restaurantId, (err, restaurant) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant/edit');
        } else {
            restaurant.pictureURL = ((req.file) ? "/" + req.file.filename : "http://www.alsglobal.com/~/media/Images/Divisions/Life%20Sciences/Food/ALS-Food-Hero.jpg"), // TODO: Set the default img

            restaurant.save((err) => {
                if (err) {
                    req.flash('errors', err);
                    return res.redirect('/restaurant/edit');
                } else {
                    req.flash('success', { msg: 'Profile picture has been updated.' });
                    return res.redirect('/restaurant');
                }
            });

        }
    });
};