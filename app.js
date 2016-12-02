var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var linkHandler = require('./productListHandler');
var gp = require('./globalProperties')

var _chunkVolume = 75;
var _startUrl = 0;
var _endUrl = _chunkVolume;

gp._emitter.on('categoriesParse', function () {
    let toCount = 0
    //recurtion to the last chunk
    let nextEventName = 'categoriesParse';
    if (_endUrl < gp._ProductCategoriesUrls.length)
        toCount = _endUrl;
    else {
        toCount = gp._ProductCategoriesUrls.length 
        //if the last portion of categories
        nextEventName = 'subCategoriesParse'
    }
    let volume = toCount - _startUrl;
    for (let i = _startUrl; i < toCount; i++) {
        linkHandler.handleLinks(gp._ProductCategoriesUrls[i], volume, nextEventName);
    }
    _startUrl += _chunkVolume;
    _endUrl += _chunkVolume;
});

gp._emitter.on('subCategoriesParse', function () {
    if (gp._SubCategoriesUrls.length > 0)
        subcategoriesParse('subCategoriesParse');
    else {
        gp._ListOfProductLinks.sort();
        console.log('links count' + gp._ListOfProductLinks.length); 
        console.log('gp._ListOfProductLinks');
        csvWriter.writeLinksToCsv(gp._ListOfProductLinks, gp._ListFileName);  
    }
});

var subcategoriesParse = function (eventName) {
    //debugger;
    if (gp._SubCategoriesUrls.length === 0) {
        gp._emitter.emit(eventName);
    } else {
        let subCategories = gp._SubCategoriesUrls;
        gp._SubCategoriesUrls = [];
        for (var i = 0; i < subCategories.length; i++) {
            linkHandler.handleLinks(subCategories[i], subCategories.length, eventName)
        }
    }
}

 const _ProductListUrl = "http://www.1800wheelchair.com/category/all-categories/";
//UNCOMMENT AND RUN
 linkHandler.fillProductCategoriesLinks(_ProductListUrl, 'categoriesParse');



// // // const csvReader = require('./csvReader');
// // // csvReader.ReadLinksFromCsv('files/ProductsList1.csv')

