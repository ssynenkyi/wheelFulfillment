

// var downloadAndSaveImage = exports.downloadAndSaveImage = function (text) {
//     var cheerio = require("cheerio");
//     var $ = cheerio.load(text);
//     var images = $('img');
//     if (images.length > 0) {
//         for (var i = 0; i < images.length; i++) {
//             var oldUrl = $(images[i]).attr('src');
//             var partsOfPath = oldUrl.split('/');
//             if (partsOfPath.length > 0) {
//                 var imageName = partsOfPath[partsOfPath.length - 1].replace(new RegExp('%20', 'g'), '_');
//                 var newUrl = '/pdfs/contentImages/' + imageName
//                 saveImage(oldUrl, 'contentImages/' + imageName);
//                 text = text.replace(oldUrl, newUrl);
//             }
//         }
//     }
//     return text;
// }

// var saveImage = exports.saveImage = function (uri, filepath) {
//     if (!fileExists(filepath)) {
//         _downloadStartedCount++;
//         var file = fs.createWriteStream(filepath);
//         try {
//             var request = http.get("http://www.cpapsupplyusa.com" + uri, function (response) {
//                 response.pipe(file);
//                 _downloadCompletedCount++;
//                 if (!_lastImageParsedEmited && _readyToBeEmit) {
//                     _lastImageParsedEmited = true;
//                     _emitter.emit("theLastImageParsed");
//                 }
//             });
//         }
//         catch (ex) {
//             debugger;
//         }
//     }
// }

// var downloadBigImage = function (zoomUrl) {
//     request(zoomUrl, function (error, response, html) {
//         if (!error) {
//             var $ = cheerio.load(html);
//             $('#RightColumn').filter(function () {
//                 var data = $(this);
//                 var img = data.find("img");
//                 var pidsp = response.request.uri.href.split('ProductId=')[1];
//                 if (pidsp != undefined && pidsp != '') {
//                     var parts = pidsp.split('&');
//                     if (parts && parts != undefined && parts.length > 0) {
//                         var productId = parts[0];
//                         var product = getProduct(productId);
//                         var src = $(img).attr('src');
//                         var srcUrlParts = src.split('/');
//                         var imageName = srcUrlParts[srcUrlParts.length - 1];
//                         saveImage(src, 'images/' + imageName);
//                         product.images.push(imageName);
//                         saveProduct(product);
//                     }
//                 }
//                 _downloadedImagesCount++;
//                 if (_downloadedImagesCount == _totalImagesCount) {
//                     if (_downloadStartedCount == _downloadCompletedCount) {
//                         _lastImageParsedEmited = true;
//                         _emitter.emit('theLastImageParsed');
//                     } else {
//                         _readyToBeEmit = true;
//                     }
//                 }
//             });
//         }
//     });
// }


