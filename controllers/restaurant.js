const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');

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
            Product.find({ restaurantId: req.user.restaurantId }, null, 
            {limit: 16, skip: getSkip(1, 16), sort: { date: -1 }}, (err, products) => {
                if (err) {
                    //callback function return error
                    req.flash('errors', err);
                    return res.redirect('/restaurant');
                } else {
                    //successfully braunch
                    res.render('restaurant/restaurant', {
                        title: 'Restaurant',
                        products: products,
                        restaurant: restaurant
                    });
                }
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
 * Get Restaurant middleware
 */
exports.middlewareGetResturant = (req, res, next) => {
    Restaurant.findById(req.user.restaurantId, (err, restaurant) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant/edit');
        } else {
            req.restaurant = restaurant;
            req.cloudinary_oldImgUrl = req.restaurant.pictureURL;
            next();
        }
    });
};

/**
 * Save Restaurant, ex. middlewareGetResturant is required
 */
exports.saveResturant = (req, res) => {
    const restaurant = req.restaurant;
    restaurant.pictureURL = ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "http://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg"), 
    restaurant.save((err) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant/edit');
        } else {
            req.flash('success', { msg: 'Profile picture has been updated.' });
            return res.redirect('/restaurant');
        }
    });
};

/**
 * GET /restaurant/product
 * Create product page.
 */
exports.getAddProduct = (req, res) => {
    res.render('restaurant/addproduct', {
        title: 'Add product',
        date: new Date().toISOString().slice(0, 16).replace('T', ' ') // Date today
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
        pictureURL: ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "http://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg"),
        price: parseFloat(req.body.price),
        quantity: parseInt(req.body.quantity),
        startdate: new Date(req.body.startdate),
        enddate: new Date(req.body.enddate),
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
 * GET /restaurant/editproduct
 * Edit product page.
 */
exports.getEditProduct = (req, res) => {
    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            res.render('restaurant/editproduct', {
                title: 'Restaurant',
                product: product
            });
        }
    });
};

/**
 * POST /restaurant/product/edit/5
 * Edit product page.
 */
exports.postEditProduct = (req, res) => {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('price', 'Price cannot be blank').notEmpty();
    req.assert('quantity', 'Quantity cannot be blank').notEmpty();
    req.assert('description', 'Description cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/restaurant/product');
    }

    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {

            product.name = req.body.name;
            product.description = req.body.description || '';
            product.price = req.body.price;
            product.quantity = parseInt(req.body.quantity);
            product.startdate = new Date(req.body.startdate);
            product.enddate = new Date(req.body.enddate);

            product.save((err) => {
            if (err) {
                req.flash('errors', err);
            } else {
                req.flash('success', { msg: 'Product has been updated successfully!' });
            }
            return res.redirect('/restaurant');
        });
        }
    });
};

/**
 * Get product middleware
 */
exports.middlewareGetProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {  
            req.product = product;
            req.cloudinary_oldImgUrl = req.product.pictureURL;
            next();
        }
    });
};

/**
 * Save Product, ex. middlewareGetProduct is required
 */
exports.saveProduct = (req, res) => {
    const product = req.product;
    product.pictureURL = ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "http://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg");
    product.save((err) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            req.flash('success', { msg: 'Product picture has been updated.' });
            return res.redirect('/restaurant');
        }
    });
};

/**
 * POST /restaurant/product/edit/5
 * Edit product page.
 */
exports.postEditPictureProduct = (req, res) => {
    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {  
            product.pictureURL = ((res.req.cloudinary_imgUrl) ? res.req.cloudinary_imgUrl : "http://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg"), 

            product.save((err) => {
            if (err) {
                req.flash('errors', err);
            } else {
                req.flash('success', { msg: 'Product has been updated successfully!' });
            }
            return res.redirect('/restaurant');
        });
        }
    });
};

/**
 * GET /restaurant/deleteproduct
 * Delete product page.
 */
exports.getDeleteProduct = (req, res) => {
    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            res.render('restaurant/deleteproduct', {
                title: 'Delete product',
                product: product
            });
        }
    });
};

/**
 * POST /restaurant/deleteproduct
 * Delete product page.
 */
exports.postDeleteProduct = (req, res) => {
    const id = req.params.id;
    Product.findOne({ _id: id, restaurantId: req.user.restaurantId }).remove((err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            req.flash('success', { msg: 'Product has been deleted successfully!' });
            return res.redirect('/restaurant');
        }
    });
};


/**
 * GET /restaurant/products/5
 * Products list page.
 */
exports.getProducts = (req, res) => {
    const limit = parseInt(req.query.limit) || 16;
    const page = req.params.page;
    if (page === 1) { return res.redirect('/restaurant')}
    Product.find({ restaurantId: req.user.restaurantId }, null,
    {limit: limit, skip: getSkip(page, limit), sort: { date: -1 }}, (err, products) => {
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

function getSkip(page, limit) {
    return (page*limit)-limit;
}

/**
 * GET /restaurant/orders
 * Orders list page.
 */
exports.getOrders = (req, res) => {
    const limit = parseInt(req.query.limit) || 16;
    const page = req.params.page;
    Order.find({$and: [
        {restaurantId: req.user.restaurantId}, 
        {email: {$exists: true}},
        {price: {$exists: true}}
    ]}, null,
    {limit: limit, skip: getSkip(page, limit), sort: { date: -1 }}, (err, orders) => {
        if (err) {
            //callback function return error
            req.flash('errors', err);
            return res.redirect('/restaurant');
        } else {
            //successfully braunch
            res.render('restaurant/orderspage', {
                title: 'Order List',
                orders: orders
            });
        }
    });
};