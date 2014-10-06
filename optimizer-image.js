var optimizer = require('optimizer');
var parallel = require('raptor-async/parallel');
var imageSize = require('image-size');

var plugin = function(optimizer, config) {

    var handler = {
        properties: {
            'path': 'string'
        },

        init: function(optimizerContext, callback) {
            if (!this.path) {
                return callback(new Error('"path" is required for a Marko dependency'));
            }

            this.path = this.resolvePath(this.path);
            callback();
        },

        object: true, // We are exporting a simple JavaScript object

        read: function(optimizerContext, callback) {

            plugin.getImageInfo(this.path, { optimizer: optimizer}, function(err, imageInfo) {
                if (err) {
                    return callback(err);
                }

                callback(null, JSON.stringify(imageInfo));
            });
        },

        getLastModified: function(optimizerContext, callback) {
            optimizerContext.getFileLastModified(this.path, callback);
        }
    };

    ['png',
     'jpeg',
     'jpg',
     'gif',
     'webp'].forEach(function(ext) {
        optimizer.dependencies.registerRequireType(ext, handler);
     });
};


plugin.getImageInfo = function(path, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    var pageOptimizer;
    var optimizerContext;

    if (options) {
        pageOptimizer = options.optimizer;
        optimizerContext = options.optimizerContext;
    }

    if (!pageOptimizer) {
        pageOptimizer = optimizer.defaultPageOptimizer;
    }

    if (!optimizerContext) {
        optimizerContext = pageOptimizer.createOptimizerContext({});
    }

    optimizerContext.getFileLastModified(path, function(err, lastModified) {
        var cache = optimizerContext.cache.getCache('optimizer-images');
        cache.get(
            path,
            {
                lastModified: lastModified,
                builder: function(callback) {
                    var imageInfo = {};
                    parallel([
                            function(callback) {
                                pageOptimizer.optimizeResource(path, optimizerContext, function(err, resourceInfo) {
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