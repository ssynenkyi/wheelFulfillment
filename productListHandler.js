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
                /// added product result calculations
                // var resultContent = $('.results');
                // if (resultContent && resultContent.length > 0) {
                //     var resultsString = resultContent.html().replace(' Result(s)', '');
                //     var results = Number(resultsString);
                //     // if (results && results > 0) {
                //     //     gp._TotalResultsCount += results;
                //     // }
                //     // if (results > 120) {
                //     //     gp._ResultsWhereMoreThan5Pages.push(results);
                //     //     console.log('more than 120: ' + results + "current link: " + currentLink);
                //     //     //console.log('')
                //     // }
                // }
                ///
                parseProductsLinks($productList, $)

            } else if (gp._SubCategoriesUrls.indexOf(currentLink) < 0) {
                var $categoryList = $('.category-view');
                //if there are categories on the page parse categories 
                if ($categoryList && $categoryList.length > 0) {
                    parseCategories($categoryList, $)
                }
            } else {
                console.log('Bad Link: ' + currentLink);
            }
            if (linksInChunkCount != null && completedEventName != null) {
                if (++_ParsedLinksCount == linksInChunkCount) {
                    _ParsedLinksCount = 0;
                    gp._emitter.emit(completedEventName)
                    console.log('total products: ' + gp._TotalResultsCount);
                    console.log('total more than 120: ' + gp._ResultsWhereMoreThan5Pages);
                }
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
            $('.xsitemap-categories').filter(function () {
                var data = $(this);
                var productsUrls = data.find('li a');
                for (var i = 0; i < productsUrls.length; i++) {
                    var $url = $(productsUrls[i]);
                    var href = $url.attr('href');
                    if (gp._ProductCategoriesUrls.indexOf(href) < 0) {
                        gp._ProductCategoriesUrls.push(href);
                    } else {
                        //jast for test
                        gp._RepeatedCategoriesCount++;
                    }
                }
                console.log(gp._ProductCategoriesUrls.length + " categories collected");
                console.log(gp._RepeatedCategoriesCount + " repeated categories");
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
                console.log('product inserted: ' + href);
                gp._ProductUrls.push(href);
            }
        }
        //add pager logic here       
        nextPageUrl = $('.pagination li:not(.disabled) a:not(.next.i-next)');
        var nextPageHref = [];
        if (nextPageUrl.length > 0) {
            //nextPageHref = nextPageUrl.attr('href');
            for (let i = 0; i < nextPageUrl.length; i++) {
                nextPageHref.push(nextPageUrl[0].attribs.href);
            }
        }
        if (nextPageHref.length > 0) {
            //parse products
            //exports.handleLinks(nextPageHref, null, null);
            for (let i = 0; i < nextPageHref.length; i++) {
                gp._SubCategoriesUrls.push(nextPageHref[i]);
            }
        }
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