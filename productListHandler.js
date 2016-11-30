const cheerio = require('cheerio')
const request = require('request')
const app = require('./app')
const gp = require('./globalProperties')

var _ParsedLinksCount = 0;

exports.handleLinks = function (currentLink, linksInChunkCount, completedEventName) {
    request(currentLink, function (error, response, html) {
        //_insideLinks++;
        //console.log('fpl inside :' + _insideLinks);
        if (!error) {
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
            if (++_ParsedLinksCount == linksInChunkCount) {
                _ParsedLinksCount = 0;
                gp._emitter.emit(completedEventName)
            }
        } else {
            debugger;
        }
    });
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
        }
    })
}


var parseProductsLinks = function (productList, $) {
    productList.filter(function () {
        var data = $(this);
        var productsUrls = data.find('.product-name a');
        for (var i = 0; i < productsUrls.length; i++) {
            var href = $(productsUrls[i]).attr('href');
            if (gp._ProductUrls.indexOf(href) < 0) {
                gp._ProductUrls.push(href);
            }
        }
        //add pager logic here
          // var nextPageUrl = '';
                        // var $aNextPage = $('.pagination a.next i-next');
                        // if ($aNextPage.length > 0) {
                        //     nextPageUrl = $aNextPage.attr('href');
                        // }
                        // if (_parsedCategoriesCount == _ProductCategoriesUrls.length - 5) {
                        //     debugger;
                        // }
                        // if (nextPageUrl != '') {
                        //     fillProductLinks(nextPageUrl, false);
                        // } else if (_parsedCategoriesCount == _ProductCategoriesUrls.length) {
                        //     _emitter.emit('theLastPageLinksParsed');
                        // }
    });
}
var parseCategories = function (categoryList, $) {
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
}