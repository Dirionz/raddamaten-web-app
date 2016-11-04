const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  Restaurant.find({}, (err, restaurants) => {
    if (err) {
      req.flash('errors', err);
      res.render('home', {
        title: 'Home'
      });
    } else {
      Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}}, {quantity: {$gt: 0}}]}, null,
      {limit: 16, sort: { enddate: 1 }}, (err, products) => {
        if (err) {
          req.flash('errors', err);
            res.render('home', {
            title: 'Home'
          });
        } else {
            res.render('home', {
              title: 'Home',
              products: products
            });
        }
      });
    }
  });
};

/**
 * GET /products/5
 * Products list page.
 */
exports.getProducts = (req, res) => {
    const limit = parseInt(req.query.limit) || 16;
    const currentCount = parseInt(req.params.currentCount);
    Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}}, {quantity: {$gt: 0}}]}, null,
    {limit: limit, skip: currentCount, sort: { enddate: 1 }}, (err, products) => {
        if (err) {
            //callback function return error
            return res.sendStatus(500);
        } else {
            //successfully braunch
            res.render('products/products', {
                title: 'Products List',
                products: products
            });
        }
    });
};