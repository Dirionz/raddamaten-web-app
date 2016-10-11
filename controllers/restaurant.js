/**
 * GET /restaurant
 * Restaurant page.
 */
exports.getRestaurant = (req, res) => {
    res.render('restaurant/restaurant', {
        title: 'Restaurant'
    });
};

/**
 * GET /restaurant/addproduct
 * Create product page.
 */
exports.getAddProduct = (req, res) => {
    res.render('restaurant/addproduct', {
        title: 'Add product'
    });
};

/**
 * GET /restaurant/edit
 * Edit Restaurant page.
 */
exports.getEditRestaurant = (req, res) => {
    res.render('restaurant/editrestaurant', {
        title: 'Edit restaurant'
    });
};