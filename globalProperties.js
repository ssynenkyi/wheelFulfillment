var EventEmitter = require('events').EventEmitter;
exports._emitter = new EventEmitter();
exports._Products =  [];
exports._ProductsCount = 0;
exports._parsedImagesCount = 0;
exports._ProductImagesCount = [];
exports._ProductListCount  = 0;
exports._ProductUrls  = [];
exports._ProductCategoriesUrls = [];
exports._SubCategoriesUrls  = [];
exports._lastImageParsedEmited= false;
exports._readyToBeEmit  = false;
exports._repeatedCategoriesCount  = 0

