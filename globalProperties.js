var EventEmitter = require('events').EventEmitter;
var _emitter = exports._emitter = new EventEmitter();
var _Products = exports._Products =  [];
var _ProductsCount = exports._ProductsCount = 0;
var _parsedImagesCount = exports._parsedImagesCount = 0;
var _ProductImagesCount = exports._ProductImagesCount = [];
var _ProductListCount= exports._ProductListCount  = 0;
//var _ProductListUrl = "http://www.1800wheelchair.com/";
var _ProductUrls= exports._ProductUrls  = [];
var _ProductCategoriesUrls = exports._ProductCategoriesUrls = [];
var _SubCategoriesUrls= exports._SubCategoriesUrls  = [];
var _lastImageParsedEmited = exports._lastImageParsedEmited= false;
var _readyToBeEmit= exports._readyToBeEmit  = false;
var _repeatedCategoriesCount= exports._repeatedCategoriesCount  = 0

// var globalProper = function () {
//     _emitter,
//     _Products,
//     _ProductsCount,
//     _parsedImagesCount,
//     _ProductImagesCount,
//     _ProductListCount,
//     _ProductUrls,
//     _ProductCategoriesUrls,
//     _SubCategoriesUrls,
//     _lastImageParsedEmited,
//     _readyToBeEmit,
//     _repeatedCategoriesCount
// }

// module.exports = globalProper;

// exports._Emitter = _emitter;
// exports._ProductUrls = _ProductUrls;
// exports._SubCategoriesUrls = _SubCategoriesUrls;
// exports._ProductCategoriesUrls = _ProductCategoriesUrls;
// exports._RepeatedCategoriesCount = _repeatedCategoriesCount


