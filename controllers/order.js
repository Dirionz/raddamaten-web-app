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
        if (!order) {req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); };
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
                        Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}},{ restaurantId: restaurant._id }, {quantity: {$gt: 0}}]},
                        null, {sort: { enddate: 1 }}, (err, products) => {
                            if (err) {
                                req.flash('errors', err);
                                res.render('home', {
                                    title: 'Räddamaten'
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
    if(!req.query.orderId || !req.query.productId) {
        return res.status(400).send();
    }
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
 * GET /order/product/remove
 * Remove product from Order.
 * This function should get called by ajax or similar
 */
exports.deleteFromOrder = (req, res) => {
    if(!req.query.orderId || !req.query.productId) {
        return res.status(400).send();
    }
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
    req.assert('restaurantId', 'RestaurantId hittades inte').notEmpty();
    req.assert('productId', 'ProductId hittades inte').notEmpty();

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
            if (!order) {req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); };
            if (order.email) {req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); }; // This order has already been payed for.
            if (!order.products.length > 0) {req.flash('errors', { msg: 'Kundvagnen är tom' }); return res.redirect('/order/'+req.params.orderId); }; 
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
    const currentDate = new Date();
    productList.forEach(function(product) {
        if (!(product.quantity > 0) || product.enddate < currentDate) {
            errlist.push({ msg: 'Produkten finns inte längre: ' + product.name});
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
exports.postStripe = (req, res, next) => {
  const orderId     = req.params.orderId;
  const stripeToken = req.body.stripeToken;
  const stripeEmail = req.body.stripeEmail;
  Order.findById(req.params.orderId, (err, order) => { 
    if (err) {
        req.flash('errors', err);
        return res.redirect('/order/checkout/'+orderId);
    } else {
        if (!order) { req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); };
        stripe.charges.create({
            amount: parseFloat(order.price)*100, // Stripe expects the price in "cents"
            currency: 'sek',
            source: stripeToken,
            description: order.objectId.substr(orderId.length - 5) // TODO: Change to Something + the orderId (last 5)
        }, (err) => {
            if (err && err.type === 'StripeCardError') {
                req.flash('errors', { msg: 'Ditt kort har avvisats' });
                return res.redirect('/order/checkout/'+orderId);
            }
        
            order.email = stripeEmail;
            order.save((err) => {});
            //req.flash('success', { msg: 'Your card has been successfully charged.' });
            //res.redirect('/order/successful/'+orderId+'/?email='+stripeEmail);
            req.succesfulOrder = order;
            next();
        });
      }
  });
};

/**
 * GET middleware
 * Find order
 */
exports.getOrder = (req, res, next) => {
  Order.findById(req.params.orderId, (err, order) => { 
    if (err) {
        req.flash('errors', { msg: 'Hittades inte' }); 
         return res.redirect('/'); 
    } else {
        if (!order) { req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); };
        req.succesfulOrder = order;
        next();
    }
  });
};

/**
 * GET middleware
 * Send email
 */
exports.sendEmail = (req, res, next) => {
    const email = req.succesfulOrder.email;
    const orderId = req.succesfulOrder._id; 

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
                res.redirect('/order/successful/'+orderId + '/?success=false&email='+email);
            } else {
                res.redirect('/order/successful/'+orderId + '/?success=true&email='+email);
            }
        });
    } else {
        res.redirect('/order/successful/'+orderId + '/?success=false&email='+email);
    }
};

/**
 * GET /order/successful/5
 * Show the successful order information
 */
exports.successfulOrder = (req, res) => {
    const successSendEmail = (req.query.success === "true");
    const email = req.query.email || "";
    const orderId = req.params.orderId;
    if (!orderId) { req.flash('errors', { msg: 'Hittades inte' }); return res.redirect('/'); };
    return res.render('products/successfulorder', {
        email: email,
        orderId: orderId,
        successSendEmail: successSendEmail
    });
};
