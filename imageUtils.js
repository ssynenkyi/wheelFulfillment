var fs = require('fs');
var cheerio = require("cheerio");
var fileExists = require('file-exists');


exports.downloadAndSaveImage = function (text) {
    
    var $ = cheerio.load(text);
    var images = $('img');
    if (images.length > 0) {
        for (var i = 0; i < images.length; i++) {
            var oldUrl = $(images[i]).attr('src');
            var partsOfPath = oldUrl.split('/');
            if (partsOfPath.length > 0) {
                var imageName = partsOfPath[partsOfPath.length - 1].replace(new RegExp('%20', 'g'), '_');
                var newUrl = '/pdfs/contentImages/' + imageName
                saveImage(oldUrl, 'contentImages/' + imageName);
                text = text.replace(oldUrl, newUrl);
            }
        }
    }
    return text;
}


var _totalImagesCount = 0;
var _downloadedImagesCount = 0

exports.imagesDownload = function (productId) {
    var imgZoomUrl = "http://www.cpapsupplyusa.com/ZoomImage.aspx?ProductId=" + productId;
    request(imgZoomUrl, function (error, response, html) {
        if (!error) {

            var $ = cheerio.load(html);
            $('#RightColumn').filter(function () {
                var data = $(this);
                var images = data.find("img");
                if (images && images.length > 0) {
                    var srcUrlParts = $(images[0]).attr('src').split('/');
                    var imageName = srcUrlParts[srcUrlParts.length - 1];
                    var product = getProduct(productId);
                    product.mainImage = imageName;
                    saveProduct(product);
                }
            })

            $('#gallery').filter(function () {
                // if (response.req.__inspector_url__.indexOf('46f3b86a-9eba-415e-ae6e-76bb6725a506') >= 0) {
                //     debugger;
                // }
                var data = $(this);
                var anchers = data.find("a");
                for (var index = 0; index < anchers.length; index++) {
                    if (index <= 4) {
                        _totalImagesCount++;
                        var url = $(anchers[index]).attr('href');
                        downloadBigImage('http://www.cpapsupplyusa.com' + url);
                    }
                }
            });
        }
    });
}

var downloadBigImage = function (zoomUrl) {
    request(zoomUrl, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('#RightColumn').filter(function () {
                var data = $(this);
                var img = data.find("img");
                var pidsp = response.request.uri.href.split('ProductId=')[1];
                if (pidsp != undefined && pidsp != '') {
                    var parts = pidsp.split('&');
                    if (parts && parts != undefined && parts.length > 0) {
                        var productId = parts[0];
                        var product = getProduct(productId);
                        var src = $(img).attr('src');
                        var srcUrlParts = src.split('/');
                        var imageName = srcUrlParts[srcUrlParts.length - 1];
                        saveImage(src, 'images/' + imageName);
                        product.images.push(imageName);
                        saveProduct(product);
                    }
                }
                _downloadedImagesCount++;
                if (_downloadedImagesCount == _totalImagesCount) {
                    if (_downloadStartedCount == _downloadCompletedCount) {
                        _lastImageParsedEmited = true;
                        _emitter.emit('theLastImageParsed');
                    } else {
                        _readyToBeEmit = true;
                    }
                }
            });
        }
    });
}
var _downloadStartedCount = 0;
var _downloadCompletedCount = 0;
var saveImage = function (uri, filepath) {
    if (!fileExists(filepath)) {
        _downloadStartedCount++;
        var file = fs.createWriteStream(filepath);
        try {
            var request = http.get("http://www.cpapsupplyusa.com" + uri, function (response) {
                response.pipe(file);
                _downloadCompletedCount++;
                if (!_lastImageParsedEmited && _readyToBeEmit) {
                    _lastImageParsedEmited = true;
                    _emitter.emit("theLastImageParsed");
                }
            });
        }
        catch (ex) {
            debugger;
        }
    }
}

