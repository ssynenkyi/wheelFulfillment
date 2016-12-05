var request = require('request');
var cheerio = require('cheerio');
var Product = require('./Product.js');
var gp = require('./globalProperties');
var parseUrl = require('url').parse;
var getBaseName = require('path').basename;

const hash = require('string-hash');

var _parsedProducts = 0;

exports.parseProduct = function (url, done, categoryUrl) {
    request(url, function (error, response, html) {
        if(url == 'http://www.1800wheelchair.com/product/diestco-wheelchair-cargo-shelf/') {
            debugger;
        }

        if (!error) {
            let categoryName = categoryByUrlGet(categoryUrl);
            addCategoryName(categoryName);
            parseDetails(html, done, categoryName);
        }
    })
};

var parseDetails = function (html, done, categoryName) {
    var $ = cheerio.load(html);

    $('#product_addtocart_form').filter(function () {
        var data = $(this);
        var product = new Product(/*categoryName*/"Transport Wheelchairs");//Temporary desision

        var paragrarphs = data.find("#product-details-tab .basic-information p");
        for (var i = 0; i < paragrarphs.length; i++) {
            var paragraphHtml = $(paragrarphs[i]).html();
            if (paragraphHtml.indexOf('sku') > -1) {
                $j = cheerio.load(paragraphHtml);
                product.sku = $j('span').html();
            }
            if (paragraphHtml.indexOf('brand') > -1) {
                $j = cheerio.load(paragraphHtml);
                product.brand = $j('span').html();
                if (!gp._Brands.includes(product.brand)) {
                    gp._Brands.push(product.brand);
                }
            }
            if (paragraphHtml.indexOf('item #') > -1) {
                $j = cheerio.load(paragraphHtml);
                product.productId = $j('span').html();
            }
        }

        // getting all images of current product
        const images = data.find('#more-view-thumbs a'),
            imageUrls = [],
            maxCountOfImages = 5;

        for (let i in images) {
            let lengthOfProductImages = product.images.length,
                imageAttributes = images[i].attribs;

            if (images.hasOwnProperty(i)) {
                if (imageAttributes && imageAttributes['data-image']
                    && lengthOfProductImages <= maxCountOfImages) {
                    let oldUrl = imageAttributes['data-image'],
                        newUrl = getNewUrlForImage(oldUrl, product.productId);

                    if (i == 0) {
                        product.mainImage = newUrl;
                    }

                    product.images.push(newUrl);

                    imageUrls.push({
                        newUrl,
                        oldUrl,
                        productId: product.productId,
                    });
                }
            }
        }

        product.name = cleanText(data.find('.product-name').text());
        product.price = getFloat(data.find(".price").text());
        var panels = data.find(".product-view-sublock");
        for (var i = 0; i < panels.length; i++) {
            var panelHtml = $(panels[i]).html();
            //var panelHtmlH2 = $(.html();
            if (panelHtml.indexOf('<h2>Features') > -1) {
                product.features = cleanText(panelHtml);
            }
            if (panelHtml.indexOf('<h2>Description') > -1) {
                product.description = cleanText(panelHtml);
            }
            if (panelHtml.indexOf('<h2>Specifications') > -1) {
                product.specifications = cleanText(panelHtml);
            }
        }


        done(null, { product, imageUrls });
    });
};

function getNewUrlForImage(url, productId) {
    const parsed = parseUrl(url),
        title = getBaseName(parsed.pathname),
        hashed = hash(productId),
        path = `./images/${hashed}-${title}`;

    return path;
}

var cleanText = function (text) {
    if (text != null && text != undefined && text != '') {


        if (text.indexOf('class="mobile-description collapsible"') >= 0) {
            text = text.replace('class="mobile-description collapsible"', '');
        }
        if (text.indexOf('class="nav-button collapsed navbar-toggle"') >= 0) {
            text = text.replace('class="nav-button collapsed navbar-toggle"', 'class="" style="display: none"');
        }
        if (text.indexOf('<h2>') >= 0) {
            text = text.replace(new RegExp('<h2>', 'g'), '<h4>');
        }
        if (text.indexOf('</h2>') >= 0) {
            text = text.replace(new RegExp('</h2>', 'g'), '</h4>');
        }
        if (text.indexOf('collapse') >= 0) {
            text = text.replace(new RegExp('collapse', 'g'), '');
        }
        if (text.indexOf('collapsible') >= 0) {
            text = text.replace(new RegExp('collapsible', 'g'), '');
        }
        // if (text.indexOf('class="nav-button collapsed navbar-toggle"') >= 0) {
        //     text = text.replace('class="nav-button collapsed navbar-toggle"', 'class="" style="display: none"');
        // }
        return text.trim().replace(new RegExp('™', 'g'), '');
    }
    return '';
}

var getFloat = function (strPrice) {
    var result = 0;
    if (strPrice != '') {
        result = parseFloat(strPrice.replace('$', '').replace(',', '').trim());
    }
    return result;
}


var addCategoryName = function (categoryName) {
    if (!gp._CategoriesNames.includes(categoryName)) {
        gp._CategoriesNames.push(categoryName);
    }
}
var categoryByUrlGet = function (categoryUrl) {
    var result = ""
    var urlPropArray = categoryUrl.pathname.split('/').filter(s => s != '');
    if (urlPropArray[0] === 'category') {
        //last parameter split by '-', make every first letter uppercase, join splitted array  with ' '
        result = urlPropArray[urlPropArray.length - 1].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
    return result
}