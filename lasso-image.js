var lasso = require('lasso');
var parallel = require('raptor-async/parallel');
var imageSize = require('image-size');

var plugin = function(lasso, config) {

    var handler = {
        properties: {
            'path': 'string'
        },

        init: function(lassoContext, callback) {
            if (!this.path) {
                return callback(new Error('"path" is required for a Marko dependency'));
            }

            this.path = this.resolvePath(this.path);
            callback();
        },

        object: true, // We are exporting a simple JavaScript object

        read: function(lassoContext, callback) {

            plugin.getImageInfo(this.path, { lasso: lasso}, function(err, imageInfo) {
                if (err) {
                    return callback(err);
                }

                callback(null, JSON.stringify(imageInfo));
            });
        },

        getLastModified: function(lassoContext, callback) {
            lassoContext.getFileLastModified(this.path, callback);
        }
    };

    ['png',
     'jpeg',
     'jpg',
     'gif',
     'webp'].forEach(function(ext) {
        lasso.dependencies.registerRequireType(ext, handler);
     });
};


plugin.getImageInfo = function(path, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    var theLasso;
    var lassoContext;

    if (options) {
        theLasso = options.lasso;
        lassoContext = options.lassoContext;
    }

    if (!theLasso) {
        theLasso = lasso.defaultPageOptimizer;
    }

    if (!lassoContext) {
        lassoContext = theLasso.createLassoContext({});
    }

    // NOTE: lassoContext.getFileLastModified caches file timestamps
    lassoContext.getFileLastModified(path, function(err, lastModified) {
        var cache = lassoContext.cache.getCache('lasso-image');
        cache.get(
            path,
            {
                lastModified: lastModified,
                builder: function(callback) {
                    var imageInfo = {};
                    parallel([
                            function(callback) {
                                theLasso.optimizeResource(path, lassoContext, function(err, resourceInfo) {
                                    imageInfo.url = resourceInfo.url;
                                    callback();
                                });
                            },
                            function(callback) {
                                imageSize(path, function (err, dimensions) {
                                    imageInfo.width = dimensions.width;
                                    imageInfo.height = dimensions.height;
                                    callback();
                                });
                            }
                        ],
                        function(err) {
                            if (err) {
                                return callback(err);
                            }

                            return callback(null, imageInfo);
                        });
                }
            },
            callback);
    });
};

module.exports = plugin;