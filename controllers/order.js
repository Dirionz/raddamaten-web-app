const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const nodemailer = require('nodemailer');

/**
 * GET /order/5
 * Order page.
 */
exports.getOrderPage = (req, res) => {
  Order.findById(req.params.orderId, (err, order) => { 
      if (err) {
        req.flash('errors', err);
        res.redirect('/');
      } else {
        if (!order) {req.flash('errors', { msg: 'Not found' }); return res.redirect('/'); };
        Product.find({ _id: { $in: order.products } }, (err, orderProducts) => {
            if (err) {
                req.flash('errors', err);
                res.redirect('/');
            } else {
                Restaurant.findById(order.restaurantId, (err, restaurant) => {
                    if (err) {
                        req.flash('errors', err);
                        res.redirect('/');
                    } else {
                        Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}},{ restaurantId: restaurant._id }]}, (err, products) => {
                            if (err) {
                                req.flash('errors', err);
                                    res.render('home', {
                                    title: 'Home'
                                });
                            } else {
                                const fullOrderProducts = placeDuplicates(order.products, orderProducts);
                                const price = getPrice(fullOrderProducts);
                                res.render('products/orderpage', {
                                    title: 'Order',
                                    restaurant: restaurant,
                                    products: products,
                                    order: order,
                                    orderProducts: fullOrderProducts,
                                    price: price
                                });
                            }
                        });
                    }
                });
            }
        });
      }
      
  });
};


/**
 * GET /order/product/add
 * Add product to Order.
 * This function should get called by ajax or similar
 */
exports.addToOrder = (req, res) => { // Add product to order
    Order.findById(req.query.orderId, (err, order) => { 
        if(err) {
            req.flash('errors', err);
            return res.render('partials/flash', {});
        } else {
            order.products.push(req.query.productId);

            order.save((err) => {
                if (err) {
                    req.flash('errors', err);
                    return res.render('partials/flash', {});
                } else {
                    Product.find({ _id: { $in: order.products } }, (err, orderProducts) => { 
                        if(err) {
                            req.flash('errors', err)
                            return res.render('partials/flash', {});
                        } else {
                            const fullOrderProducts = placeDuplicates(order.products, orderProducts);
                            const price = getPrice(fullOrderProducts);
                            return res.render('products/order', {
                                orderProducts: fullOrderProducts,
                                price: price,
                                order: order
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

/**
 * POST /order/product/remove
 * Remove product from Order.
 * This function should get called by ajax or similar
 */
exports.deleteFromOrder = (req, res) => {
    Order.findById(req.query.orderId, (err, order) => { 
        if(err) {
            req.flash('errors', err);
            return res.render('partials/flash', {});
        } else {
            order.products = removeProductId(req.query.productId, order.products);

            order.save((err) => {
                if (err) {
                    req.flash('errors', err);
                    return res.render('partials/flash', {});
                } else {
                    Product.find({ _id: { $in: order.products } }, (err, orderProducts) => { 
                        if(err) {
                            req.flash('errors', err)
                            return res.render('partials/flash', {});
                        } else {
                            const fullOrderProducts = placeDuplicates(order.products, orderProducts);
                            const price = getPrice(fullOrderProducts);
                            return res.render('products/order', {
                                orderProducts: fullOrderProducts,
                                price: price,
                                order: order
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * Remove object from array by searching through the array 
 * and remove the object then return the array
 */
function removeProductId(nameKey, myArray){
    var count = 0;
    var newArray = [];
    for (var i=0; i < myArray.length; i++) {
        if (String(myArray[i]) === nameKey && count < 1) {
            count++;
            // Ignore the object to be removed
        } else {
            newArray.push(myArray[i]);
        }
    }
    return newArray;
}

/**
 * POST /order/
 * Create Order.
 */
exports.postNewOrder = (req, res) => {
    req.assert('restaurantId', 'RestaurantId cannot be empty').notEmpty();
    req.assert('productId', 'ProductId cannot be empty').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/');
    }

    Product.findById(req.body.productId, (err, product) => { 
        if (err) {
            req.flash('errors', errors);
            return res.redirect('/');
        } else {

            // Create new order
            const order = new Order({
                products: [req.body.productId],
                restaurantId: req.body.restaurantId,
            });
        
            order.save((err) => {
                if (err) {
                    req.flash('errors', err);
                    res.redirect('/');
                } else {
                    res.redirect('/order/'+order._id);   
                }
            });
         }
     });
};

/**
 * GET /order/checkout/5
 * Checkout the Order.
 */
exports.checkoutOrder = (req, res) => {
    Order.findById(req.params.orderId, (err, order) => { 
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
                    // The user might want to refresh the page...
                    if (!order.isCheckedout) {
                        // Need to return list of errors in case exists
                        const proderr = productsExits(orderProducts);
                        if (proderr) {
                            req.flash('errors', proderr)
                            return res.redirect('/order/'+req.params.orderId);
                        } else {
                            order.isCheckedout = true;
                            order.products.forEach(function(id) {
                                Product.update({$and: [{ _id: id }, { quantity: {$gte: 0}}]},
                                {$inc: {quantity: -1}}, (err) => {});
                            });
                        }
                    }
                    const fullOrderProducts = placeDuplicates(order.products, orderProducts);
                    const price = getPrice(fullOrderProducts);
                    order.price = price;
                    order.save((err) => {
                        if (err) {
                            req.flash('errors', err);
                            return res.redirect('/order/'+req.params.orderId);
                        } else {
                            return res.render('products/checkout', {
                                orderProducts: fullOrderProducts,
                                price: price,
                                order: order,
                                publishableKey: process.env.STRIPE_PKEY
                            });
                        }
                    });
                }
            });

        }
    });
};

function productsExits(productList) {
    var errlist = [];
    productList.forEach(function(product) {
        if (!(product.quantity > 0)) {
            errlist.push({ msg: 'Product no longer exists: ' + product.name});
        }
    });
    if (errlist.length > 0) {
        return errlist;
    }
}

/**
 * POST /order/checkout/5
 * Make a payment.
 */
exports.postStripe = (req, res) => {
  const orderId     = req.params.orderId;
  const stripeToken = req.body.stripeToken;
  const stripeEmail = req.body.stripeEmail;
  Order.findById(req.params.orderId, (err, order) => { 
    if (err) {
        req.flash('errors', err);
        return res.redirect('/order/checkout/'+orderId);
    } else {
        if (!order) { req.flash('errors', { msg: 'Not found' }); return res.redirect('/'); };
        stripe.charges.create({
            amount: parseFloat(order.price)*100, // Stripe expects the price in "cents"
            currency: 'sek',
            source: stripeToken,
            description: stripeEmail
        }, (err) => {
            if (err && err.type === 'StripeCardError') {
                req.flash('errors', { msg: 'Your card has been declined.' });
                return res.redirect('/order/checkout/'+orderId);
            }
        
            order.email = stripeEmail;
            order.save((err) => {});
            req.flash('success', { msg: 'Your card has been successfully charged.' });
            res.redirect('/order/successful/'+orderId+'/?email='+stripeEmail);
        });
      }
  });
};

/**
 * GET /order/successful/5
 * Show the successful order information
 */
exports.successfulOrder = (req, res) => {
    const email = req.query.email;
    const orderId = req.params.orderId; // TODO: Need to validate the orderId here?
    if (email) {
        const transporter = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: process.env.MAILGUN_USER,
                pass: process.env.MAILGUN_PASSWORD
            }
        });
        const mailOptions = {
            to: email,
            from: '"Räddamaten" <order@raddamaten.se>', // TODO: Change the email address as well as text
            subject: 'Reset your password on Hackathon Starter',
            text: 'Something'
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                req.flash('errors', { msg: `An e-mail could not be sent to ${email}` });
                return res.render('products/successfulorder', {
                    email: email,
                    orderId: orderId
                });
            } else {
                req.flash('info', { msg: `An e-mail has been sent to ${email} with the order information.` });
                return res.render('products/successfulorder', {
                    email: email,
                    orderId: orderId
                });
            }
        });
    } else {
        req.flash('errors', { msg: `An e-mail could not be sent, no email specified` });
        return res.render('products/successfulorder', {
            email: email,
            orderId: orderId
        });
    }
};