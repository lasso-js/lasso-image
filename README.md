optimizer-image
================

This module provides a plugin for the [RaptorJS Optimizer](https://github.com/raptorjs/optimizer) and a JavaScript API
that allows image info (URL, width and height) to be retrieved on both the server and the client.

# Installation

Install the plugin:

```
npm install optimizer-image --save
```

Enable the plugin:

```javascript
require('optimizer').configure({
    plugins: [
        'optimizer-image',
        ...
    ]
})
```

# Usage

The following code can be used to get image info (URL, width and height) on both the server and the client:

```javascript
var optimizerImage = require('optimizer-image');
optimizerImage.getImageInfo(require.resolve('./my-image.png'), function(err, imageInfo) {
    if (err) {
        // Handle the error
    }

    console.log('URL: ', imageInfo.url);
    console.log('width: ', imageInfo.width);
    console.log('height: ', imageInfo.height);
});
```

Referenced images will automatically be optimized and written and the URL for the optimized image will be returned. The
result is cached (on the server) so there is no performance penalty in making subsequent calls for the same image path.
