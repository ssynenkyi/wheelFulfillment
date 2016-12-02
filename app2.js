const csvReader = require('./csvReader');
const gp = require('./globalProperties')
const request = require('request');
const cheerio = require('cheerio');
const csvWriter = require('./csvWriter');


var _productUrls = [];
var _duplicatedProductUrls = [];

var productsFill = function () {
     csvReader.ReadLinksFromCsv('files/ProductsList1.csv', 'parseProduct')
}
var _chunkVolume = 50;
var _startUrl = 0;
var _endUrl = _chunkVolume;

gp._emitter.on('parseProduct', function () {
    let toCount = 0
    //recurtion to the last chunk
    let nextEventName = 'parseProduct';
    if (_endUrl < gp._ListOfProductLinks.length)
        toCount = _endUrl;
    else {
        toCount = gp._ListOfProductLinks.length
        //if the last portion of categories
        nextEventName = 'writeProducts'
    }
    let volume = toCount - _startUrl;
    for (let i = _startUrl; i < toCount; i++) {
        productsParse(gp._ListOfProductLinks[i], volume, nextEventName);
    }
    _startUrl += _chunkVolume;
    _endUrl += _chunkVolume;
});

function compare(a,b) {
  if (a.caregory < b.caregory)
    return -1;
  if (a.caregory > b.caregory)
    return 1;
  return 0;
}

gp._emitter.on('writeProducts', function () {
    console.log('links count' + _products);
    console.log('duplicated products ' + _dupl);
    console.log('categories ' + _resultArray.length);
    _resultArray.sort(compare);
    csvWriter.writeProductsUtls(_resultArray);
})

var _parsedLinksCount = 0
var _listCount = 0;
var _products = 0;
var _dupl = 0;
var _resultArray = [];

var productsParse = function (link, linksInChunkCount, completedEventName) {
    request(link, function (error, response, html) {
        if (!error) {
            console.log('-----');
            console.log('list # : ' + ++_listCount + ' list url: ' + link);
            var $ = cheerio.load(html);
            var $productList = $('#products-list');
            //if  there is product list on th page parce products list
            if ($productList && $productList.length > 0) {
                $productList.filter(function () {
                    var data = $(this);
                    var productsUrls = data.find('.product-name a');
                    let purls = [];
                    for (var i = 0; i < productsUrls.length; i++) {
                        var href = $(productsUrls[i]).attr('href');
                        if (_productUrls.indexOf(href) < 0) {
                            purls.push(href);
                            _productUrls.push(href);
                            console.log('ins: ' + href + " count: " + (++_products));
                        } else {
                            console.log('dupl: ' + href + " count: " + (++_dupl));
                        }
                    }
                    _resultArray.push({
                        caregory: link,
                        products: purls
                    });
                });
            }
            if (linksInChunkCount != null && completedEventName != null) {
                if (++_parsedLinksCount == linksInChunkCount) {
                    _parsedLinksCount = 0;
                    gp._emitter.emit(completedEventName)
                }
            }
        }
    })
}


productsFill()