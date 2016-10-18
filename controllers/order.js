const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

/**
 * GET /
 * Order page.
 */
exports.getOrderPage = (req, res) => {
  Restaurant.findById(req.params.restaurantId, (err, restaurant) => {
    if (err) {
      req.flash('errors', err);
      res.redirect('/');
    } else {
      Product.find({ restaurantId: restaurant._id }, (err, products) => {
        if (err) {
          req.flash('errors', err);
            res.render('home', {
            title: 'Home'
          });
        } else {
            res.render('products/orderpage', {
              title: 'Order',
              restaurant: restaurant,
              products: products
            });
        }
      });
    }
  });
};

