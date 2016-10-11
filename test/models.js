const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');

describe('User Model', () => {
    it('should create a new user', (done) => {
        const user = new User({
            email: 'test@gmail.com',
            password: 'password'
        });
        user.save((err) => {
            expect(err).to.be.null;
            expect(user.email).to.equal('test@gmail.com');
            expect(user).to.have.property('createdAt');
            expect(user).to.have.property('updatedAt');
            done();
        });
    });

    it('should not create a user with the unique email', (done) => {
        const user = new User({
            email: 'test@gmail.com',
            password: 'password'
        });
        user.save((err) => {
            expect(err).to.be.defined;
            expect(err.code).to.equal(11000);
            done();
        });
    });

    it('should find user by email', (done) => {
        User.findOne({ email: 'test@gmail.com' }, (err, user) => {
            expect(err).to.be.null;
            expect(user.email).to.equal('test@gmail.com');
            done();
        });
    });

    it('should delete a user', (done) => {
        User.remove({ email: 'test@gmail.com' }, (err) => {
            expect(err).to.be.null;
            done();
        });
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
        price: "123 Kr",
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
        price: "123 Kr",
        quantity: 2
    });

    const product2 = new Product({
        name: "product2",
        description: "description",
        pictureURL: "",
        price: "123 Kr",
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