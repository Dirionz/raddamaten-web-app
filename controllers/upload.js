var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
});

const BANNEDNAME = 'sample'; // Default img should not be deleted

/**
 * Upload img middleware
 */
exports.imgUpload = (req, res, next) => {
    const file = req.files.myFile;
    if (file.size > 0) {
        cloudinary.uploader.upload(file.path, function(result) {
            if (result.error) {
                req.flash('errors', result.error);
                return res.redirect(req.url);
            }
            req.cloudinary_imgUrl = result.secure_url;
            next();
        });
    } else {
        next();
    }
};

/**
 * Remove img middleware
 */
exports.imgRemoveOld = (req, res, next) => {
    var url = req.cloudinary_oldImgUrl;
    var name = getNameFromUrl(url);
    if (name == BANNEDNAME) {
    } else {
        // Don't remove any imgages right now
        //cloudinary.uploader.destroy(getNameFromUrl(url), function(result) { /* Ignore result for now */ });
    }
    next();
};

/**
 * Get the name of the file from url
 */
function getNameFromUrl(url) {
    return (url) ? url.split( '/' ).pop().split('.')[0] : "";
}

exports.removeImage = function(url) {
    var name = getNameFromUrl(url);
    if (name == BANNEDNAME) {
    } else {
        // Don't remove any images right now
        //cloudinary.uploader.destroy(getNameFromUrl(url), function(result) { /* Ignore result for now */ });
    }
}
