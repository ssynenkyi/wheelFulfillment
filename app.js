var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
//var http = require('http');
//var pdfUtils = require("./pdfUtils");
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var linkHandler = require('./productListHandler');
var Product = require('./Product.js').Product
var gp = require('./globalProperties')
var productParser = require('./productParser')
const iu = require('./imageUtils');


gp._emitter.on('parseProduct', function () {
    if (gp._ProductListCount < gp._ProductUrls.length) {
        productParser.parseProduct(gp._ProductUrls[gp._ProductListCount]);
    }
    gp._ProductListCount++;   
})

var _chunkLinksCount = 75;

gp._emitter.on('secondChunkParsed', function () {
    subcategoriesParse('subCategoriesParsed');
});

gp._emitter.on('subCategoriesParsed', function () {
    if (gp._SubCategoriesUrls.length > 0)
        subcategoriesParse('subCategoriesParsed');
    else
       gp._emitter.emit('parseProduct');
});


//second part of categories 
gp._emitter.on('firstChunkParsed', function () {
    let restOfCategoriesCount = gp._ProductCategoriesUrls.length - _chunkLinksCount;
    for (var i = _chunkLinksCount; i < gp._ProductCategoriesUrls.length; i++) {
        linkHandler.handleLinks(gp._ProductCategoriesUrls[i], restOfCategoriesCount, 'secondChunkParsed');
    }
});

//first part of categories
gp._emitter.on('FirstPageCategoryParsed', function () {
    //first 75 lists of products parse
    for (var i = 0; i < _chunkLinksCount; i++) {
        linkHandler.handleLinks(gp._ProductCategoriesUrls[i], _chunkLinksCount, 'firstChunkParsed');
    }
});

var subcategoriesParse = function (eventName) {
    debugger;
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

gp._emitter.on('theLastPageLinksParsed', function () {
    for (var i = 0; i < gp._ProductUrls.length; i++) {
       productParser.parseProduct(gp._ProductUrls[i]);
    }
})


gp._emitter.on('theLastImageParsed', function () {
    csvWriter.writeCsv( gp._Products, 'result');
});



gp._emitter.on('theLastProductParsed', function () {
    for (var i = 0; i < gp._Products.length; i++) {
        iu.imagesDownload( gp._Products[i].productId);
    }
});


const _ProductListUrl = "http://www.1800wheelchair.com/";
linkHandler.fillProductCategoriesLinks(_ProductListUrl, 'FirstPageCategoryParsed');


// var pdfsWithSpacesReplace = function (html, pdfLinks) {
//     if (pdfLinks.length > 0) {
//         for (var i = 0; i < pdfLinks.length; i++) {
//             if (pdfLinks[i].indexOf('/pdfs/') < 0) {
//                 var newLink = '/pdfs/' + pdfLinks[i].substring(6, pdfLinks[i].trim().length);
//                 html = html.replace(pdfLinks[i], newLink);
//                 pdfLinks[i] = newLink;
//             }
//             if (pdfLinks[i].indexOf('%20') >= 0) {
//                 var newLink = pdfLinks[i].replace(new RegExp('%20', 'g'), '_');
//                 html = html.replace(pdfLinks[i], newLink);
//             }
//         }
//     }
//     return html;
// }
// var descriptionGet = function (data) {
//     var pdfList = pdfsDownload(data, 'Desc');
//     var desc = data.find('span[id$="_lblDescription"]');
//     if (desc != undefined && desc.length > 0) {
//         var result = pdfsWithSpacesReplace(desc.html(), pdfList);
//         return result;
//     }
//     return '';
// }

// var pdfsDownload = function (data, containerId) {
//     var pdfList = []
//     var anchers = data.find('#' + containerId + ' a');
//     if (anchers.length > 0) {
//         for (var i = 0; i < anchers.length; i++) {
//             if (anchers[i].attribs != undefined &&
//                 anchers[i].attribs.href != undefined &&
//                 anchers[i].attribs.href.toLowerCase().indexOf(/pdfs/) == 0) {
//                 pdfUtils.downloadFile(anchers[i].attribs.href);
//                 pdfList.push(anchers[i].attribs.href);
//             }
//         }
//     }
//     return pdfList;
// }



// var isFloat = function (n) {
//     if (n == '')
//         return false;
//     n = n.replace('$', '').trim();
//     return Number(n) == n;
// }

