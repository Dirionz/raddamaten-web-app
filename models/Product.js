const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    pictureURL: String,
    price: Number,
    ordPrice: Number,
    quantity: Number,
    startdate: { type: Date, default: '2000-10-10T08:00' },
    enddate: { type: Date, default: '2000-10-10T09:00' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Getter
productSchema.path('price').get(function(num) {
  return parseFloat(Math.round(num) / 100).toFixed(2);
});

// Setter
productSchema.path('price').set(function(num) {
  return num * 100;
});

// Getter
productSchema.path('ordPrice').get(function(num) {
  if (num) {
    return parseFloat(Math.round(num) / 100).toFixed(2);
  }
  return null;
});

// Setter
productSchema.path('ordPrice').set(function(num) {
  if (num) {
    return num * 100;
  }
  return null;
});

/**
 *  Notify admin middleware 
 */
productSchema.pre('save', function(next) {
    const product = this;
    if (product.isModified('startdate')) {

      // Notify admin here.
      var Restaurant = require('./Restaurant');
      Restaurant.findById(product.restaurantId, (err, restaurant) => {
        var subject, message;
        subject = 'Ny/Uppdaterad produkt från ' + ((restaurant) ? restaurant.name : 'okänd');
        message = 'Produkten (' 
                + product.name
                + ') har blivit satt till publicering den ' 
                + getLocalISOString(product.startdate).slice(0, 16).replace('T', ' ')
                + ' till '
                + getLocalISOString(product.enddate).slice(0, 16).replace('T', ' ')
        var adminNotify = require('../tools/adminNotify');
        adminNotify.sendEmail(subject, message);
      })
    }
    next();
});

function getLocalISOString(date) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return localISOTime = (new Date(date - tzoffset)).toISOString().slice(0,-1);
}


module.exports = Product;
