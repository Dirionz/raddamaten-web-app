const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });
});

describe('GET /products/5', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/products/5')
            .expect(200, done);
    });
});

describe('GET /order/123', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/order/123')
            .expect(302, done);
    });
});

describe('GET /order/product/add', () => {
    it('should return 400 Bad Request', (done) => {
        request(app)
            .get('/order/product/add')
            .expect(400, done);
    });
});

describe('GET /order/product/delete', () => {
    it('should return 400 Bad request', (done) => {
        request(app)
            .get('/order/product/delete')
            .expect(400, done);
    });
});

describe('GET /order/successful/123', () => {
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

describe('GET /logout', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/logout')
            .expect(302, done);
    });
});

describe('GET /forgot', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/login')
            .expect(200, done);
    });
});

describe('GET /reset/123', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/reset/123')
            .expect(302, done);
    });
});

describe('GET /signup', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/signup')
            .expect(200, done);
    });
});

describe('GET /signup/restaurant/asdf', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/signup/restaurant/asdf')
            .expect(302, done);
    });
});

describe('GET /account', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/account/')
            .expect(302, done);
    });
});

describe('GET /account/', () => {
    it('should return 302 Redirect', (done) => {
        request(app)
            .get('/account/')
            .expect(302, done);
    });
});

describe('GET /restaurant', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant')
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

describe('GET /restaurant/product/edit/5', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/product/edit/5')
            .expect(302, done);
    });
});

describe('GET /restaurant/product/delete/5', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/product/delete/5')
            .expect(302, done);
    });
});

describe('GET /restaurant/orders', () => {
    it('should return 302 Found', (done) => {
        request(app)
            .get('/restaurant/orders/')
            .expect(302, done);
    });
});

describe('GET /api', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/api')
            .expect(200, done);
    });
});

// describe('GET /contact', () => {
//     it('should return 200 OK', (done) => {
//         request(app)
//             .get('/contact')
//             .expect(200, done);
//     });
// });

describe('GET /random-url', () => {
    it('should return 404', (done) => {
        request(app)
            .get('/reset')
            .expect(404, done);
    });
});