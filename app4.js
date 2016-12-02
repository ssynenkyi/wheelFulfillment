const http = require('http'),
        fs = require('fs'),
        eachLimit = require('async/eachLimit'),
        fileExists = require('file-exists'),
        jsonHandler = require('./jsonHandler'),
        imageObjFile = './files/imageObjects.txt';

let countOfAllImages = 0,
    countOfDownloadedImages = 0;

function saveImagesFromFile(filename) {
    const imageObjects = jsonHandler.read(filename),
            limitOfConcurrentDownloads = 50;

    countOfAllImages = imageObjects.length;
    console.log(`Have to be downloaded: ${countOfAllImages}.`);

    eachLimit(imageObjects, limitOfConcurrentDownloads, (obj, cb) => {
        saveImage(obj.productId, obj.oldUrl, obj.newUrl, cb);
    }, err => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(`All images were successfully saved.`);
        }
    });
}

function saveImage(productId, url, path, cb) {
    function confirmImageDownloading() {
        countOfDownloadedImages += 1;
        console.log(`Downloaded: ${countOfDownloadedImages}. Image ${path} of Product ${productId} was saved`);
        cb();
    }

    if (!fileExists(path)) {
        let file = fs.createWriteStream(path);

        http.get(url, res => {
            // TODO: move confirmImageDownloading to res.on('close')
            res.on('close', () => {});
            res.on('error', err => { console.log(err); cb(err); });

            res.pipe(file);
            confirmImageDownloading();
        });
    } else {
        confirmImageDownloading();
    }
}

saveImagesFromFile(imageObjFile);