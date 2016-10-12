const Product = require('../models/Product');

/**
 * GET /restaurant
 * Restaurant page.
 */
exports.getRestaurant = (req, res) => {
    res.render('restaurant/restaurant', {
        title: 'Restaurant'
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
 * POST /restaurant/addproduct
 * Create product page.
 */
exports.postAddProduct = (req, res) => { // TODO: Add date 
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('price', 'Price cannot be blank').notEmpty();
    req.assert('quantity', 'Quantity cannot be blank').notEmpty();
    req.assert('description', 'Description cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/restaurant/addproduct');
    }

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        pictureURL: ((req.file) ? "/uploads/" + req.file.filename : "http://www.alsglobal.com/~/media/Images/Divisions/Life%20Sciences/Food/ALS-Food-Hero.jpg"), // TODO: Set the default img
        price: req.body.price,
        quantity: parseInt(req.body.quantity),
        restaurant: req.user.restaurant
    });

    product.save((err) => {
        if (err) {
            req.flash('errors', err);
        } else {
            req.flash('success', { msg: 'Product has been added successfully!' });
            return res.redirect('/restaurant/addproduct');
        }
    });

};

/**
 * GET /restaurant/edit
 * Edit Restaurant page.
 */
exports.getEditRestaurant = (req, res) => {
    res.render('restaurant/editrestaurant', {
        title: 'Edit restaurant'
    });
};