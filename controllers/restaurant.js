/**
 * GET /
 * Restaurant page.
 */
exports.getRestaurant = (req, res) => {
    res.render('restaurant/restaurant', {
        title: 'Restaurant'
    });
};