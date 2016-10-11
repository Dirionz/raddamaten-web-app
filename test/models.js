const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

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
    it('should create a new restaurant', (done) => {
        const user = new User({
            email: 'test@gmail.com',
            password: 'password'
        });
        user.save((err) => {
            expect(err).to.be.null;
            expect(user.email).to.equal('test@gmail.com');
            expect(user).to.have.property('createdAt');
            expect(user).to.have.property('updatedAt');

            const restaurant = new Restaurant({
                name: "test",
                aboutUs: "aboutUs",
                pictureURL: "tets",
                user: user._id,
                location: { longiture: 1.234234, latiture: 1.34234234 }
            })
            restaurant.save((err) => {
                expect(err).to.be.null;
                expect(restaurant.name).to.equal('test');
                expect(restaurant).to.have.property('createdAt');
                expect(restaurant).to.have.property('updatedAt');
            });
            done();
        });
    });

    it('should find restaurant by user email', (done) => {
        User.findOne({ email: 'test@gmail.com' }, (err, user) => {
            expect(err).to.be.null;
            expect(user.email).to.equal('test@gmail.com');
            Restaurant.findOne({ user: user._id }, (err, restaurant) => {
                expect(err).to.be.null;
                expect(restaurant.name).to.equal('test');
            });
            done();
        });
    });

    it('should delete a restaurant and user', (done) => {
        User.findOne({ email: 'test@gmail.com' }, (err, user) => {
            expect(err).to.be.null;
            expect(user.email).to.equal('test@gmail.com');
            Restaurant.remove({ user: user._id }, (err) => {
                expect(err).to.be.null;
                User.remove({ _id: user._id }, (err) => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});