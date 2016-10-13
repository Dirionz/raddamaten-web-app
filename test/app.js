const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });
});

describe('GET /login', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/login')
            .expect(200, done);
    });
});

describe('GET /signup', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/signup')
            .expect(200, done);
    });
});

describe('GET /restaurant', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant')
            .expect(302, done);
    });
});

describe('GET /restaurant/product', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/product')
            .expect(302, done);
    });
});

describe('GET /restaurant/products/2', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/products/2')
            .expect(302, done);
    });
});

describe('GET /restaurant/edit', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/edit')
            .expect(302, done);
    });
});

describe('GET /signup/restaurant', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/signup/restaurant')
            .expect(200, done);
    });
});

describe('GET /api', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/api')
            .expect(200, done);
    });
});

describe('GET /contact', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/contact')
            .expect(200, done);
    });
});

describe('GET /random-url', () => {
    it('should return 404', (done) => {
        request(app)
            .get('/reset')
            .expect(404, done);
    });
});