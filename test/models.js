const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');
const expect = chai.expect;

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');

describe('User Model', () => {
  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;

    UserMock
      .expects('save')
      .yields(null);

    user.save(function (err, result) {
      UserMock.verify();
      UserMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should not create a user with the unique email', (done) => {
    const UserMock = sinon.mock(User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'MongoError',
      code: 11000
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      email: 'test@gmail.com'
    };

    userMock
      .expects('findOne')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedUser);

    User.findOne({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.email).to.equal('test@gmail.com');
      done();
    })
  });

  it('should remove user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedResult = {
      nRemoved: 1
    };

    userMock
      .expects('remove')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedResult);

    User.remove({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    })
  });
});

describe('Restaurant Model', () => {
    it('should create a new restaurant', (done) => {
        const RestaurantMock = sinon.mock(new Restaurant({
            name: "test",
            aboutUs: "aboutUs",
            pictureURL: "tets",
            street: "street",
            postalCode: "234234",
            city: "Jönköping"
        }));
        const restaurant = RestaurantMock.object

        RestaurantMock
            .expects('save')
            .yields(null);

        restaurant.save((err, result) => {
            RestaurantMock.verify();
            RestaurantMock.restore();
            expect(err).to.be.null;
            done();
        });
    });

  it('should return error if restaurant is not created', (done) => {
        const RestaurantMock = sinon.mock(new Restaurant({
            name: "test",
            aboutUs: "aboutUs",
            pictureURL: "tets",
            street: "street",
            postalCode: "234234",
            city: "Jönköping"
        }));
        const restaurant = RestaurantMock.object;
        const expectedError = {
            name: 'ValidationError'
        };

        RestaurantMock
        .expects('save')
        .yields(expectedError);

        restaurant.save((err, result) => {
            RestaurantMock.verify();
            RestaurantMock.restore();
            expect(err.name).to.equal('ValidationError');
            expect(result).to.be.undefined;
            done();
        });
  });

  it('should remove restaurant', (done) => {
    const restaurantMock = sinon.mock(Restaurant);
    const expectedResult = {
      nRemoved: 1
    };

    restaurantMock
      .expects('remove')
      .yields(null, expectedResult);

    Restaurant.remove({_id: restaurantMock._id}, (err, result) => {
      restaurantMock.verify();
      restaurantMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    })
  });
});

describe('Product Model', () => {
    it('should create a new product', (done) => {
        const RestaurantMock = sinon.mock(Restaurant);
        const ProductMock = sinon.mock(new Product({
            name: "product",
            description: "description",
            pictureURL: "",
            price: 123,
            quantity: 2,
            restaurant: RestaurantMock._id
        }));
        const product = ProductMock.object;

        ProductMock
            .expects('save')
            .yields(null);

        product.save((err, result) => {
            ProductMock.verify();
            ProductMock.restore();
            expect(err).to.be.null;
            done();
        });
    });

  it('should return error if product is not created', (done) => {
        const RestaurantMock = sinon.mock(Restaurant);
        const ProductMock = sinon.mock(new Product({
            name: "product",
            description: "description",
            pictureURL: "",
            price: 123,
            quantity: 2,
            restaurant: RestaurantMock._id
        }));
        const product = ProductMock.object;

        const expectedError = {
            name: 'ValidationError'
        };
        ProductMock
            .expects('save')
            .yields(expectedError);

        product.save((err, result) => {
            ProductMock.verify();
            ProductMock.restore();
            expect(err.name).to.equal('ValidationError');
            expect(result).to.be.undefined;
            done();
        });
  });

  it('should remove product', (done) => {
    const productMock = sinon.mock(Product);
    const expectedResult = {
      nRemoved: 1
    };

    productMock
      .expects('remove')
      .yields(null, expectedResult);

    Product.remove({_id: productMock._id}, (err, result) => {
      productMock.verify();
      productMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    })
  });
});

describe('Order Model', () => {
    it('should create a new order', (done) => {
        const RestaurantMock = sinon.mock(Restaurant);
        const ProductMock = sinon.mock(Product);
        const OrderMock = sinon.mock(new Order({
            email: "test@gmail.com",
            restaurantId: RestaurantMock._id,
            products: [ProductMock._id, ProductMock._id]
        }));
        const order = OrderMock.object;

        OrderMock
            .expects('save')
            .yields(null);

        order.save((err, result) => {
            OrderMock.verify();
            OrderMock.restore();
            expect(err).to.be.null;
            done();
        });
    });

  it('should return error if order is not created', (done) => {
        const RestaurantMock = sinon.mock(Restaurant);
        const ProductMock = sinon.mock(Product);
        const OrderMock = sinon.mock(new Order({
            email: "test@gmail.com",
            restaurantId: RestaurantMock._id,
            products: [ProductMock._id, ProductMock._id]
        }));
        const order = OrderMock.object;

        const expectedError = {
            name: 'ValidationError'
        };

        OrderMock
            .expects('save')
            .yields(expectedError);

        order.save((err, result) => {
            OrderMock.verify();
            OrderMock.restore();
            expect(err.name).to.equal('ValidationError');
            expect(result).to.be.undefined;
            done();
        });
  });

  it('should remove order', (done) => {
    const orderMock = sinon.mock(Order);
    const expectedResult = {
      nRemoved: 1
    };

    orderMock
      .expects('remove')
      .yields(null, expectedResult);

    Order.remove({_id: orderMock._id}, (err, result) => {
      orderMock.verify();
      orderMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    })
  });
});