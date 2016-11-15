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
    const restaurant = new Restaurant({
        name: "test",
        aboutUs: "aboutUs",
        pictureURL: "tets",
        street: "street",
        postalCode: "234234",
        city: "Jönköping"
    })

    it('should create a new restaurant', (done) => {
        restaurant.save((err) => {
            expect(err).to.be.null;
            expect(restaurant.name).to.equal('test');
            expect(restaurant).to.have.property('createdAt');
            expect(restaurant).to.have.property('updatedAt');
            done();
        });
    });

    it('should delete a restaurant', (done) => {
        restaurant.remove((err) => {
            expect(err).to.be.null;
            done();
        });
    });
});

describe('Product Model', () => {

    const restaurant = new Restaurant({
        name: "test",
        aboutUs: "aboutUs",
        pictureURL: "tets",
        street: "street",
        postalCode: "234234",
        city: "Jönköping"
    });

    const product = new Product({
        name: "product",
        description: "description",
        pictureURL: "",
        price: 123,
        quantity: 2,
        restaurant: restaurant._id
    });

    it('should create a new product', (done) => {
        restaurant.save((err) => {
            expect(err).to.be.null;
            expect(restaurant.name).to.equal('test');
            expect(restaurant).to.have.property('createdAt');
            expect(restaurant).to.have.property('updatedAt');

            product.save((err) => {
                expect(err).to.be.null;
                expect(product.name).to.equal('product');
                expect(product).to.have.property('createdAt');
                expect(product).to.have.property('updatedAt');
                done();
            });
        });
    });

    it('should delete a restaurant and product', (done) => {
        product.remove((err) => {
            expect(err).to.be.null;
            restaurant.remove((err) => {
                expect(err).to.be.null;
                done();
            });
        });
    });
});


describe('Order Model', () => {

    const product = new Product({
        name: "product",
        description: "description",
        pictureURL: "",
        price: 123,
        quantity: 2
    });

    const product2 = new Product({
        name: "product2",
        description: "description",
        pictureURL: "",
        price: 123,
        quantity: 2
    });

    const order = new Order({
        email: "test@gmail.com",
        products: [product._id, product2._id]
    });

    it('should create a new order', (done) => {
        product.save((err) => {
            expect(err).to.be.null;
            expect(product.name).to.equal('product');
            expect(product).to.have.property('createdAt');
            expect(product).to.have.property('updatedAt');

            product2.save((err) => {
                expect(err).to.be.null;
                expect(product2.name).to.equal('product2');
                expect(product2).to.have.property('createdAt');
                expect(product2).to.have.property('updatedAt');

                order.save((err) => {
                    expect(err).to.be.null;
                    expect(order.email).to.equal('test@gmail.com');
                    done();
                });
            });
        });
    });

    it('should delete a order and products', (done) => {
        product.remove((err) => {
            expect(err).to.be.null;
            product2.remove((err) => {
                expect(err).to.be.null;
                order.remove((err) => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});