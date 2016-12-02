var request = require('request');
var cheerio = require('cheerio');
var Product = require('./Product.js');
var parseUrl = require('url').parse;
var getBaseName = require('path').basename;

exports.parseProduct = function (url, done) {
    request(url, function (error, response, html) {
        if (!error) {
            parseDetails(html, done);
        }
    })
};

var parseDetails = function (html, done) {
    var $ = cheerio.load(html);

    $('#product_addtocart_form').filter(function () {
        var data = $(this);
        var category = 'Weel Cair';
        var product = new Product(category);

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
                    let oldUrl = imageAttributes ['data-image'],
                        newUrl = getNewUrlForImage(oldUrl);

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
                product.features = panelHtml;
            }
            if (panelHtml.indexOf('<h2>Description') > -1) {
                product.description = panelHtml;
            }
            if (panelHtml.indexOf('<h2>Specifications') > -1) {
                product.specifications = panelHtml;
            }
        }

        done(null, { product, imageUrls });
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
        if (text.indexOf('/MediaPlayer.aspx?') >= 0) {
            text = text.replace(new RegExp('href="/MediaPlayer.aspx?', 'g'), 'style = "display:none" href="/MediaPlayer.aspx?');
        }
        if (text.indexOf('/blankcustom.aspx?') >= 0) {
            text = text.replace(new RegExp('href="/blankcustom.aspx?', 'g'), 'style = "display:none" href="/blankcustom.aspx?');
        }
        if (text.indexOf('headgear.aspx"') >= 0) {
            text = text.replace(new RegExp('headgear.aspx"', 'g'), 'headgear.aspx" style = "display:none"');
        }
        if (text.indexOf('href="/1073114-Respironics-GoLife-for-Men-CPAP-Mask.aspx"') >= 0) {
            text = text.replace('href="/1073114-Respironics-GoLife-for-Men-CPAP-Mask.aspx"', 'href="#"');
        }
        if (text.indexOf('CPAP Supply USA') > 0) {
            text = text.replace(new RegExp('CPAP Supply USA', 'g'), 'Medical Supply Now');
        }

        return text.trim().replace(new RegExp('™', 'g'), '');
    }
    return '';
};

var getFloat = function (strPrice) {
    var result = 0;
    if (strPrice != '') {
        result = parseFloat(strPrice.replace('$', '').replace(',', '').trim());
    }
    return result;
};