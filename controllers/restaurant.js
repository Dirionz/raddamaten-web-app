const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');
const uploadController = require('./upload');

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
            {limit: 16, sort: { enddate: -1 }}, (err, products) => {
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
 * GET restaurant/products/5
 * Products list page.
 */
exports.getProducts = (req, res) => {
    const limit = parseInt(req.query.limit) || 16;
    const currentCount = parseInt(req.params.currentCount);
    Product.find({restaurantId: req.user.restaurantId}, null,
    {limit: limit, skip: currentCount, sort: { enddate: -1 }}, (err, products) => {
        if (err) {
            //callback function return error
            return res.sendStatus(500);
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
    req.assert('name', 'Name cannot be more than 50 characters').len(0,50);
    req.assert('aboutUs', 'AboutUs cannot be more than 400 characters').len(0,400);

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
    restaurant.pictureURL = ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "https://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg"), 
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
    req.assert('name', 'Name cannot be more than 100 characters').len(0,100);
    req.assert('description', 'Description cannot be more than 400 characters').len(0,400);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/restaurant/product');
    }

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        pictureURL: ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "https://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg"),
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
    req.assert('name', 'Name cannot be more than 100 characters').len(0,100);
    req.assert('description', 'Description cannot be more than 400 characters').len(0,400);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect(req.url);
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
    product.pictureURL = ((req.cloudinary_imgUrl) ? req.cloudinary_imgUrl : "https://res.cloudinary.com/dvcj7nttu/image/upload/v1477395474/sample.jpg");
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
 * POST /restaurant/product/edit/5 // TODO: Check if this is used if not remove
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
            uploadController.removeImage(req.body.pictureURL);
            return res.redirect('/restaurant');
        }
    });
};

/**
 * GET /restaurant/orders
 * Orders list page.
 */
exports.getOrders = (req, res) => {
    
    var search_param = req.query.search_param;
    const searchString = req.query.q;
    if ((searchString && searchString.length < 4) || (search_param && !searchString)) {
        req.flash('errors', {msg: "Must type at least 4 characters"});
        return res.redirect('/restaurant/orders');
    }

    if (search_param == "ID") {
        Order.find({$and: [
            {restaurantId: req.user.restaurantId},
            {isCheckedout: true},
            {objectId: new RegExp(searchString, "i")}
        ]}, null, {sort: {updatedAt: -1}}, (err, orders) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect('/restaurant');
            } else {
                res.render('restaurant/orderspage', {
                    title: 'Order List',
                    orders: orders,
                    search_param
                });
            }
        });
    } else if(search_param == "Email") {
        Order.find({$and: [
            {restaurantId: req.user.restaurantId},
            {isCheckedout: true},
            {email: new RegExp(searchString, "i")}
        ]}, null, {sort: {updatedAt: -1}}, (err, orders) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect('/restaurant');
            } else {
                res.render('restaurant/orderspage', {
                    title: 'Order List',
                    orders: orders,
                    search_param
                });
            }
        });
    } else {
        search_param = "ID"; // Default
        const limit = parseInt(req.query.limit) || 16;
        const page = req.params.page;
        Order.find({$and: [
            {restaurantId: req.user.restaurantId}, 
            {email: {$exists: true}},
            {price: {$exists: true}}
        ]}, null,
        {limit: limit, sort: { updatedAt: -1 }}, (err, orders) => {
            if (err) {
                //callback function return error
                req.flash('errors', err);
                return res.redirect('/restaurant');
            } else {
                //successfully braunch
                res.render('restaurant/orderspage', {
                    title: 'Order List',
                    orders: orders,
                    search_param
                });
            }
        });
    }
};

/**
 * GET /restaurant/order/5
 * Order page.
 */
exports.getOrder = (req, res) => {
    const orderId = req.params.orderId;
    
    if (!orderId) {
        req.flash('errors', {msg: "Hittades inte"});
        return res.redirect('/restaurant/orders');
    }
    Order.findById(orderId, (err, order) => { 
        if(err) {
            req.flash('errors', err);
            return res.redirect('/order/'+req.params.orderId);
        } else {
            if (!order) {req.flash('errors', { msg: 'Not found' }); return res.redirect('/'); };
            Product.find({ _id: { $in: order.products } }, (err, orderProducts) => {
                if(err) {
                    req.flash('errors', err)
                    return res.redirect('/order/'+req.params.orderId);
                } else {
                    const fullOrderProducts = placeDuplicates(order.products, orderProducts);
                    const price = getPrice(fullOrderProducts);
                    order.price = price;
                    order.save((err) => {
                        if (err) {
                            req.flash('errors', err);
                            return res.redirect('/order/'+req.params.orderId);
                        } else {
                            return res.render('restaurant/order', {
                                orderProducts: fullOrderProducts,
                                price: price,
                                order: order,
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * The find function only finds puts one object in the array if found
 * Let add it multiple times if the objectId exitst more than one time
 */
function placeDuplicates(objectIds, orderProducts) {
    var newOrderProducts = [];
    for (var i = 0, len = objectIds.length; i < len; i++) {
        var product = search(objectIds[i], orderProducts);
        if (product) {
            newOrderProducts.push(product);
        }
    }
    return newOrderProducts;
}

/**
 * Search through the array and if found return it
 */
function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (String(myArray[i]._id) === String(nameKey)) {
            return myArray[i];
        }
    }
}

/**
 * Get the sum of the products in array
 */
function getPrice(products) {
    var sum = 0;
    for (var i=0; i < products.length; i++) {
        sum += parseFloat(products[i].price);
    }
    return sum;
}