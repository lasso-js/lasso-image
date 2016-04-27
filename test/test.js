'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var lassoImagePlugin = require('../'); // Load this module just to make sure it works
var lasso = require('lasso');

describe('lasso-image' , function() {

    beforeEach(function(done) {
        done();
    });

    it('should allow for reading image info on the server', function(done) {

        var lassoImage = require('../');
        lassoImage.getImageInfo(require.resolve('./fixtures/ebay.png'), function(err, imageInfo) {
            expect(imageInfo.url).to.equal('/static/ebay-73498128.png');
            expect(imageInfo.width).to.equal(174);
            expect(imageInfo.height).to.equal(30);
            done();
        });
    });

    it('should compile a image into a JavaScript module', function(done) {

        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: lassoImagePlugin,
                        config: {

                        }
                    },
                    {
                        plugin: 'lasso-require',
                        config: {
                            includeClient: false
                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage',
                dependencies: [
                    'require: ./fixtures/ebay.png'
                ],
                from: module
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, '/static/testPage.js'), {encoding: 'utf8'});
                expect(output).to.contain('174');
                expect(output).to.contain('30');
                expect(output).to.contain('/static');
                expect(output).to.contain('ebay.png');
                lasso.flushAllCaches(done);
            });
    });

    it('should compile a image into a JavaScript module when not using require', function(done) {

        var myLasso = lasso.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: lassoImagePlugin,
                        config: {

                        }
                    },
                    {
                        plugin: 'lasso-require',
                        config: {
                            includeClient: false
                        }
                    }
                ]
            });

        myLasso.lassoPage({
                name: 'testPage2',
                dependencies: [
                    './fixtures/ebay.png'
                ],
                from: module
            },
            function(err, lassoPageResult) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, '/static/testPage.js'), {encoding: 'utf8'});
                expect(output).to.contain('174');
                expect(output).to.contain('30');
                expect(output).to.contain('/static');
                expect(output).to.contain('ebay.png');
                lasso.flushAllCaches(done);
            });
    });


});
