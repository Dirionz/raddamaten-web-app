var request = require('superagent');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const PhoneNumber = require('../models/PhoneNumber');

var mailchimpInstance   = process.env.MAILCHIMP_INSTANCE
    listUniqueId        = process.env.MAILCHIMP_UID,
    mailchimpApiKey     = process.env.MAILCHIMP_APIKEY;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  var start = new Date();
  start.setHours(0,0,0,0);
  var end = new Date();
  end.setHours(23,59,59,999);
  findProducts(16, 0, (err, products) => {
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
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
function shuffle(array) {
    var a = array;
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return a;
}

/**
 * GET /products/5
 * Products list page.
 */
exports.getProducts = (req, res) => {
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    const limit = parseInt(req.query.limit) || 16;
    const currentCount = parseInt(req.params.currentCount);
    findProducts(limit, currentCount, (err, products) => {
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

function findProducts(limit, currentCount, callback) {
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    Product.find({$and:[{startdate:{$lte:end}},{enddate:{$gte:start}}]}, null,
    {limit: limit, skip: currentCount, sort: { enddate: 1 }}, (err, products) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, products.filter(isEarlierThanStartDate));
        }
    });
}

function isEarlierThanStartDate(product) {
  return product.startdate < new Date();
}

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
 * GET /sms/add
 * Add to numbers (sms)
 * This function should be called with ajax or similar
 */
exports.addToSmsNumber = (req, res) => {
  const number = req.body.number;

  const phoneNumber = PhoneNumber({
    number: number
  });

  PhoneNumber.find({$and: [{number: number}, {isVerified: true}] },  (err, numbers) => {
    if (err) return res.sendStatus(400);
    if (numbers.length != 0) return res.sendStatus(400);
    phoneNumber.save((err) => {
      if (err) {
        return res.sendStatus(400);
      } else {
          const details = {
            to: number,
            from: '+', // Save in config
            body: 'Räddamaten kod: ' + phoneNumber._id.toString().substr(phoneNumber._id.toString().length - 4) + '. Gäller i 15 minuter.'
          };
          twilio.sendMessage(details, (err, responseData) => {
            if (err) {
              return res.sendStatus(400);
            }
            return res.sendStatus(200);
          })
      }
    });
  });
}

/**
 * GET /sms/verify
 * Add to numbers (sms)
 * This function should be called with ajax or similar
 */
exports.verifySmsNumber = (req, res) => {
  const code = req.body.code;
  var date = new Date();
  date.setMinutes(date.getMinutes() - 15);

  PhoneNumber.find({$and: [
      {objectId: new RegExp(code, "i")}, 
      {createdAt: {$gte: date}}
    ]}, (err, numbers) => {
        if (err) { return res.sendStatus(400); }
        if (numbers.length ==0) { return res.sendStatus(400); }
        const number = numbers.pop();
        number.isVerified = true;
        number.save((err) => {
          if (err) {
            return res.sendStatus(400);
          }
          return res.sendStatus(200);
        })
  });
}
