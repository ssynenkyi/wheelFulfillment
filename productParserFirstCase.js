var request = require('request');
var cheerio = require('cheerio');
var Product = require('./Product.js');
var gp = require('./globalProperties');
var parseUrl = require('url').parse;
var getBaseName = require('path').basename;

var _parsedProducts = 0;

exports.parseProduct = function (url, volume, eventName, categoryUrl) {
    request(url, function (error, response, html) {
        if (!error) {
            let categoryName = categoryByUrlGet(categoryUrl);
            addCategoryName(categoryName);
            parseDetails(html, url, categoryName);
            // console.log(_Products.hength)
        } else {
            console.log('error: ' + error)
            debugger;
        }
        //for test
        var $ = cheerio.load(html);
        if ($('#product-view-tab').length > 0)
            console.log(gp._Products.length);
        else
            console.log("not here " + url);

        if (++_parsedProducts == volume) {
            _parsedProducts = 0;
            gp._emitter.emit(eventName);
        }
    })
}

var saveProduct = function (productObj) {
    var updateExistingProduct = false;
    if (gp._Products.length > 0) {
        for (i = 0; i < gp._Products.length; i++) {
            if (gp._Products[i].productId == productObj.productId) {
                gp._Products[i] = productObj;
                updateExistingProduct = true;
            }
        }
    }
    if (!updateExistingProduct) {
        gp._Products.push(productObj);
    }
}
var getProduct = function (productId) {
    if (gp._Products.length > 0) {
        for (i = 0; i < gp._Products.length; i++) {
            if (gp._Products[i].productId == productId) {
                return gp._Products[i];
            }
        }
    }
}


var parseDetails = function (html, url, categoryName) {
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
            maxCountOfImages = 5;

        for (let i in images) {
            let lengthOfProductImages = product.images.length,
                imageAttributes = images[i].attribs;

            if (images.hasOwnProperty(i)) {
                if (imageAttributes && imageAttributes['data-image']
                    && lengthOfProductImages <= maxCountOfImages) {
                    let oldUrl = imageAttributes['data-image'],
                        newUrl = getNewUrlForImage(oldUrl);

                    if (i == 0) {
                        product.mainImage = newUrl;
                    }

                    product.images.push(newUrl);

                    gp._ListOfImageUrls.push({
                        newUrl,
                        oldUrl,
                        productId: product.productId,
                    });
                }
            }
        }
        product.mainImage = product.images.length > 0 ? product.images[0] : '';

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
        product.productUrl = url;

        saveProduct(product);
    });
};

function getNewUrlForImage(url) {
    const parsed = parseUrl(url),
        time = Math.floor(Date.now() / 1000),
        title = getBaseName(parsed.pathname),
        hashed = `${time}-${title}`,
        path = `./images/${hashed}`;

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