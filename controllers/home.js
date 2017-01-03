var request = require('superagent');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

var mailchimpInstance   = process.env.MAILCHIMP_INSTANCE
    listUniqueId        = process.env.MAILCHIMP_UID,
    mailchimpApiKey     = process.env.MAILCHIMP_APIKEY;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  Restaurant.find({}, (err, restaurants) => {
    if (err) {
      req.flash('errors', err);
      res.render('home', {
        title: 'Raddamaten'
      });
    } else {
      Product.find({$and:[{startdate:{$lte:new Date()}},{enddate:{$gte:new Date()}}, {quantity: {$gt: 0}}]}, null,
      {limit: 16, sort: { enddate: 1 }}, (err, products) => {
        if (err) {
          req.flash('errors', err);
            res.render('home', {
            title: 'Raddamaten'
          });
        } else {
            res.render('home', {
              title: 'Raddamaten',
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
                title: 'Produkter',
                products: products
            });
        }
    });
};

/**
 * GET /about
 * About page.
 */
exports.about = (req, res) => {
  return res.render('about', {
    title: 'Om',
  });
};

/**
 * GET /terms
 * Terms page.
 */
exports.terms = (req, res) => {
  return res.render('terms', {
    title: 'Villkor',
  });
};

/**
 * GET /press
 * Press page.
 */
exports.press = (req, res) => {
  return res.render('press', {
    title: 'Press',
  });
};

/**
 * GET /faq
 * FAQ page.
 */
exports.faq = (req, res) => {
  return res.render('faq', {
    title: 'FAQ',
  });
};

/**
 * GET /connect
 * Connect Restaurant page.
 */
exports.connect = (req, res) => {
  return res.render('connect', {
    title: 'Anslut din restaurang',
  });
};

/**
 * GET /partners
 * View Partners Restaurant page.
 */
exports.getPartners = (req, res) => {
  Restaurant.find({}, (err, restaurants) => {
    return res.render('partners', {
      title: 'Anslutna restauranger',
      restaurants: restaurants
    })
  })
}

/**
 * POST /mailinglist/add
 * Add to mailinglist
 * This function should be called with ajax or similar
 */
exports.addToMailingList = (req, res) => {
  request
        .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
        .send({
          'email_address': req.body.email,
          'status': 'pending'
        }).end(function(err, response) {
          if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
            return res.sendStatus(200);
          } else {
            return res.sendStatus(400);
          }
      });
};

/**
 * GET /
 * Add to numbers (sms)
 * This function should be called with ajax or similar
 */
exports.addToSmsNumber = (req, res) => {
}
