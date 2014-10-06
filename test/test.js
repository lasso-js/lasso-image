'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var optimizerImagePlugin = require('../'); // Load this module just to make sure it works
var optimizer = require('optimizer');

describe('optimizer-image' , function() {

    beforeEach(function(done) {
        done();
    });

    it('should allow for reading image info on the server', function(done) {

        var optimizerImage = require('../');
        optimizerImage.getImageInfo(require.resolve('./fixtures/ebay.png'), function(err, imageInfo) {
            expect(imageInfo.url).to.equal('static/ebay-73498128.png');
            expect(imageInfo.width).to.equal(174);
            expect(imageInfo.height).to.equal(30);
            done();
        });
    });

    it('should compile a image into a JavaScript module', function(done) {

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: optimizerImagePlugin,
                        config: {

                        }
                    },
                    {
                        plugin: 'optimizer-require',
                        config: {
                            includeClient: false
                        }
                    }
                ]
            });

        pageOptimizer.optimizePage({
                name: 'testPage',
                dependencies: [
                    'require: ./fixtures/ebay.png'
                ],
                from: module
            },
            function(err, optimizedPage) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.js'), 'utf8');
                expect(output).to.contain('174');
                expect(output).to.contain('30');
                expect(output).to.contain('static/ebay-73498128.png');
                expect(output).to.contain('"/test/fixtures/ebay.png"');
                optimizer.flushAllCaches(done);
            });
    });


});
