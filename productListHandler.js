const cheerio = require('cheerio')
const request = require('request')
const app = require('./app')
const gp = require('./globalProperties')
const syncRequest = require('sync-request');
var _ParsedLinksCount = 0;
var reqCount = 0;
var doneLinks = [];

exports.handleLinks = function (currentLink, linksInChunkCount, completedEventName) {
    if (doneLinks.indexOf(currentLink) > 0) {
        console.log('=======link done before====');
        return;
    }
    console.log('before request');
    console.log('link: ' + currentLink);
    var response = syncRequest('GET', currentLink);
    doneLinks.push(currentLink);
    console.log('links done: ', doneLinks.length);
    console.log('after request');
    reqCount++;
    console.log('===requests count ' + reqCount);
    var html = response.getBody('utf-8');
    console.log('html parsed');
    var $ = cheerio.load(html);
    var $productList = $('#products-list');
    //if  there is product list on th page parce products list
    if ($productList && $productList.length > 0) {
        parseProductsLinks($productList, $)
    } else if (gp._SubCategoriesUrls.indexOf(currentLink) < 0) {
        var $categoryList = $('.category-view');
        //if there are categories on the page parse categories 
        if ($categoryList && $categoryList.length > 0) {
            parseCategories($categoryList, $)
        }
    }
    if (linksInChunkCount != null && completedEventName != null) {
        if (++_ParsedLinksCount == linksInChunkCount) {
            _ParsedLinksCount = 0;
            gp._emitter.emit(completedEventName)
        }
    }
}

exports.fillProductCategoriesLinks = function (currentLink, eventName) {
    request(currentLink, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('.home').filter(function () {
                var data = $(this);
                var productsUrls = data.find('.home-categories-text-area a');
                for (var i = 0; i < productsUrls.length; i++) {
                    var $url = $(productsUrls[i]);
                    if (!$url.hasClass('read-more')) {
                        var href = $url.attr('href');
                        if (gp._ProductCategoriesUrls.indexOf(href) < 0) {
                            gp._ProductCategoriesUrls.push(href);
                        } else {
                            //jast for test
                            gp._RepeatedCategoriesCount++;
                        }
                    }
                }
                gp._emitter.emit(eventName);
            });
        } else {
            console.log("----------fillProductCategoriesLinks----------- " + error);
        }
    })
}


var parseProductsLinks = function (productList, $) {
    console.log('inside parseProductsLinks')
    productList.filter(function () {
        var data = $(this);
        var productsUrls = data.find('.product-name a');
        for (var i = 0; i < productsUrls.length; i++) {
            var href = $(productsUrls[i]).attr('href');
            if (gp._ProductUrls.indexOf(href) < 0) {
                console.log('-product inserted: ' + href);
                gp._ProductUrls.push(href);
            } else {
                console.log('---product exists' + href);
            }
        }
        //add pager logic here
        //var nextPageUrl = $('.pagination li a.next.i-next');
        var paginationLinks = $('.pagination li:not(.disabled) a:not(.next.i-next)');
        var nextPageHref = [];
        if (paginationLinks.length > 0) {
            var paginationLinkTemplate = paginationLinks[0].attribs.href.split('?')[0];
            var lastPage = parseInt(paginationLinks[paginationLinks.length - 1].text);
            for (let i = 2; i <= lastPage; i++) {
                nextPageHref.push(paginationLinkTemplate + '?p=' + i);
            }
        }

        // nextPageUrl = $('.pagination li:not(.disabled) a:not(.next.i-next)');
        // var nextPageHref = [];
        // if(nextPageUrl.length>0){
        //     //nextPageHref = nextPageUrl.attr('href');
        //     for(let i = 0;i<nextPageUrl.length;i++){
        //         nextPageHref.push(nextPageUrl[0].attribs.href);
        //     }

        // }
        if (nextPageHref.length > 0) {
            //parse products
            //exports.handleLinks(nextPageHref, null, null);
            for (let i = 0; i < nextPageHref.length; i++) {
                gp._SubCategoriesUrls.push(nextPageHref[i]);
            }
        }
    });
    console.log('----gp._ProductUrls: ' + gp._ProductUrls.length);
}
var parseCategories = function (categoryList, $) {
    console.log('inside parseCategories');
    categoryList.filter(function () {
        var data = $(this);
        var categoriesUrls = data.find('a.category-name');
        for (var i = 0; i < categoriesUrls.length; i++) {
            var href = $(categoriesUrls[i]).attr('href');
            if (gp._SubCategoriesUrls.indexOf(href) < 0) {
                gp._SubCategoriesUrls.push(href);
            }
        }
    });
    console.log('----gp._SubCategoriesUrls: ' + gp._SubCategoriesUrls.length);
}