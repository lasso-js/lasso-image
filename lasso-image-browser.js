exports.getImageInfo = function(path, callback) {
    callback(null, require(path));
};