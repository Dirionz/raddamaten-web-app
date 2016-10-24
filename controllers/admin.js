const crypto = require('crypto');

            //crypto.randomBytes(16, (err, buf) => {
                //const token = buf.toString('hex');
                //done(err, token);
            //});

/**
 * GET /superadmin
 * SuperAdmin index page.
 */
exports.getIndex = (req, res) => {
  res.render('admin/index', {
    title: 'Admin'
  });
};