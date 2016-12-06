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


var readProductsLinks = function () {
    csvReader.readProductsUrls('files/urlObjects2.txt', 'parseProduct');
}
var readBrends = function () {
    fs.readFile('files/brandsList.txt', 'utf8', function (err, data) {
        if (err) throw err;
        gp._Brands = JSON.parse(data);
        readProductsLinks();
    });
}
var readCategories = function () {
    fs.readFile('files/categoriesNamesList.txt', 'utf8', function (err, data) {
        if (err) throw err;
        gp._CategoriesNames = JSON.parse(data);
        readBrends();
    });
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
    jsonHandler.write('./files/imageObjects.txt', gp._ListOfImageUrls, 'Image objects were successfully saved.');
    fs.writeFileSync('files/categoriesNames.csv', gp._CategoriesNames.join(','), 'utf-8');
    fs.writeFileSync('files/Brands.csv', gp._Brands.join(','), 'utf-8');
    csvWriter.writeCsv(gp._Products, 'result')
});

var parse = function (productUrl, volume, nextEventName) {
    productParser.parseProduct(productUrl);
}
readCategories();
