var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var linkHandler = require('./productListHandler');
var Product = require('./Product.js').Product
var gp = require('./globalProperties')
var productParser = require('./productParserFirstCase')
const iu = require('./imageUtils');
const csvReader = require('./csvReader');
const fs = require('fs');
const url = require('url');
const jsonHandler = require('./jsonHandler');
var fileExists = require('file-exists');


var readProductsLinks = function () {
    csvReader.readProductsUrls('files/urlObjects1.txt', 'parseProduct');
}
var readBrends = function () {
    if (!fileExists('files/brandsList.txt')) {
        readSku();
    } else {
        fs.readFile('files/brandsList.txt', 'utf8', function (err, data) {
            if (err) throw err;
            gp._Brands = JSON.parse(data);
            readSku();
        });
    }
}
var readSku = function () {
    if (!fileExists('files/skuList.txt')) {
        readProductsLinks();
    } else {
        fs.readFile('files/skuList.txt', 'utf8', function (err, data) {
            if (err) throw err;
            gp._SkuList = JSON.parse(data);
            readProductsLinks();
        });
    }
}
var readCategories = function () {
    if (!fileExists('files/categoriesNamesList.txt')) {
        readBrends();
    } else {
        fs.readFile('files/categoriesNamesList.txt', 'utf8', function (err, data) {
            if (err) throw err;
            gp._CategoriesNames = JSON.parse(data);
            readBrends();
        });
    }
}

var _parsedCategory = 0;
gp._emitter.on('parseProduct', function () {
    if (_parsedCategory < gp._ProductsUrlObject.length /*&& _parsedCategory <= 2*/) {
        if (gp._ProductsUrlObject[_parsedCategory].products.length > 0) {
            for (let i = 0; i < gp._ProductsUrlObject[_parsedCategory].products.length; i++) {
                let volume = gp._ProductsUrlObject[_parsedCategory].products.length;
                let productLink = gp._ProductsUrlObject[_parsedCategory].products[i];
                let categoryUrl = url.parse(gp._ProductsUrlObject[_parsedCategory].caregory, true, true);
                setImmediate(productParser.parseProduct, productLink, volume, 'parseProduct', categoryUrl);
            }
            _parsedCategory++;
            console.log('parsed categories: ' + _parsedCategory + '  ' + gp._ProductsUrlObject[_parsedCategory - 1].caregory)
        } else {
            _parsedCategory++;
            console.log('parsed categories: ' + _parsedCategory + '  ' + gp._ProductsUrlObject[_parsedCategory - 1].caregory)
            gp._emitter.emit('parseProduct')
        }
    } else {
        gp._emitter.emit('writeCsv')
    }
});

gp._emitter.on('writeCsv', function () {
    jsonHandler.write('./files/imageObjects.txt', gp._ListOfImageUrls, '_ListOfImageUrls successfully saved.');
    jsonHandler.write('./files/skuList.txt', gp._SkuList, '_SkuList successfully saved.');
    jsonHandler.write('./files/categoriesNamesList.txt', gp._CategoriesNames, '_CategoriesNames successfully saved.');
    jsonHandler.write('./files/brandsList.txt', gp._Brands, '_Brands successfully saved.');     
    csvWriter.writeCsv(gp._Products, 'result')
});

var parse = function (productUrl, volume, nextEventName) {
    productParser.parseProduct(productUrl);
}
readCategories();
