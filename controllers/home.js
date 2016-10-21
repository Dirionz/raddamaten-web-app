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
      Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}}]}, null,
      {limit: 16, sort: { enddate: 1 }}, (err, products) => { // TODO: Add quantity bigger than 0
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
    const page = req.params.page;
    if (page === 1) { return res.redirect('/')}
    Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}}]}, null,
    {limit: limit, skip: getSkip(page, limit), sort: { enddate: 1 }}, (err, products) => {
        if (err) {
            //callback function return error
            req.flash('errors', err);
            return res.redirect('/');
        } else {
            //successfully braunch
            res.render('products/products', {
                title: 'Products List',
                products: products
            });
        }
    });
};

function getSkip(page, limit) {
    return (page*limit)-limit;
}