var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var http = require('http');
//var excelWriter = require("./excelWriter.js");
var pdfUtils = require("./pdfUtils");
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var fileExists = require('file-exists');
var EventEmitter = require('events').EventEmitter;
//var Promise = require('Promise');
var _emitter = new EventEmitter();
var _Products = [];
var _ProductsCount = 0;
var _parsedImagesCount = 0;
var _ProductImagesCount = [];
var _ProductListUrl = "http://www.1800wheelchair.com/";
var _lastPageReached = false;
var _ProductUrls = [];
var _ProductCategoriesUrls = [];
var _SubCategoriesUrls = [];
var _lastImageParsedEmited = false;
var _readyToBeEmit = false;
var _repeatedCategoriesCount = 0
var fillProductCategoriesLinks = function (currentLink) {
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
                        if (_ProductCategoriesUrls.indexOf(href) < 0) {
                            _ProductCategoriesUrls.push(href);
                        } else {
                            _repeatedCategoriesCount++;
                        }
                    }
                }
                _emitter.emit('theCategoryParsed');
            });
        }
    })
}

_emitter.on('parseProductEvent', function () {
    if(_ProductUrls.length > 0)
    {
        var el = _ProductUrls.shift();
        parseProduct(el);
    }
})

var _parsedCategoriesCount = 0;
_emitter.on('theCategoryParsed', function () {
    var promises = [];
    var chunkVolume = 75;

    for (var i = 0; i < chunkVolume; i++) {
        promises.push(fillProductLinks(_ProductCategoriesUrls[i] /*, true*/));
    }
    Promise.all(promises).then(values => {
        debugger;
        setTimeout(function () {
            promises = [];
            for (var i = chunkVolume; i < _ProductCategoriesUrls.length; i++) {
                promises.push(fillProductLinks(_ProductCategoriesUrls[i] /*, true*/));
            }
            console.log('SECOND PART');
            Promise.all(promises).then(() => {
                subcategoriesParse();
            }).then(values => {
                debugger;
                // for (var i = 0; i < _ProductUrls.length; i++) {
                //     parseProduct(_ProductUrls[i]);
                // }
                _emitter.emit('parseProductEvent');
            });
        }, 2000);
    });
    // fillProductLinks(_ProductCategoriesUrls[0], true);
})

//var parseProducts = function
var subcategoriesParse = function () {
    debugger;
    for (var i = 0; i < _SubCategoriesUrls.length; i++) {
        //todo slavik _SubCategoriesUrls
    }
}

var _insideLinks = 0;
var _isFirstPage = false;
var fillProductLinks = function (currentLink/*, isFirstPage*/) {
    return new Promise(function (resolve, reject) {
        request(currentLink, function (error, response, html) {
            _insideLinks++;
            console.log('fpl inside :' + _insideLinks);
            if (!error) {
                var $ = cheerio.load(html);
                var $productList = $('#products-list');
                if ($productList && $productList.length > 0) {
                    $productList.filter(function () {
                        var data = $(this);
                        var productsUrls = data.find('.product-name a');
                        for (var i = 0; i < productsUrls.length; i++) {
                            var href = $(productsUrls[i]).attr('href');
                            if (_ProductUrls.indexOf(href) < 0) {
                                _ProductUrls.push(href);
                            }

                        }
                        //if (isFirstPage) {
                        _parsedCategoriesCount++;
                        console.log('parsed :' + _parsedCategoriesCount);
                        //}                      
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
                } else if (_SubCategoriesUrls.indexOf(currentLink) < 0) {
                    _SubCategoriesUrls.push(currentLink);
                }
            } else {
                debugger;
            }
            resolve('');
        });
    });
}

_emitter.on('theLastPageLinksParsed', function () {
    for (var i = 0; i < _ProductUrls.length; i++) {
        parseProduct(_ProductUrls[i]);
    }
})


_emitter.on('theLastImageParsed', function () {
    //debugger;
    var fileName = _ProductListUrl.replace('http://www.cpapsupplyusa.com/', '')
    fileName = fileName.replace(new RegExp('/', 'g'), '_');
    fileName = fileName.replace('.', '_');
    fileName = fileName.replace(new RegExp('-', 'g'), '_');
    csvWriter.writeCsv(_Products, fileName);
    //excelWriter.writeExcel(_Products, fileName);
});

_emitter.on('theLastProductParsed', function () {
    for (var i = 0; i < _Products.length; i++) {
        imagesDownload(_Products[i].productId);
    }
});


var _parseProductCallCount = 0;
var _lastProductEventCallCount = 0;

var parseProduct = exports.ParseProduct = function (url) {
    _parseProductCallCount++;
    request(url, function (error, response, html) {
        if (!error) {
            parseDetails(html);           
        }

        var $ = cheerio.load(html);

        if($('#product-view-tab').length > 0)
            console.log("here " + url);
        else
            console.log("not here " + url);

        //setTimeout(function() {
            _emitter.emit('parseProductEvent');
       // }, 300);
        
        riseEventIfTheLastProduct();
    })
}

var saveProduct = function (productObj) {
    var updateExistingProduct = false;
    if (_Products.length > 0) {
        for (i = 0; i < _Products.length; i++) {
            if (_Products[i].productId == productObj.productId) {
                _Products[i] = productObj;
                updateExistingProduct = true;
            }
        }
    }
    if (!updateExistingProduct) {
        _Products.push(productObj);
    }
}
var getProduct = function (productId) {
    if (_Products.length > 0) {
        for (i = 0; i < _Products.length; i++) {
            if (_Products[i].productId == productId) {
                return _Products[i];
            }
        }
    }
}

var riseEventIfTheLastProduct = function () {
    if (_Products.length == _ProductUrls.length) {
        _lastProductEventCallCount++;
        _emitter.emit('theLastProductParsed');
    }
}

var parseDetails = function (html) {
    var $ = cheerio.load(html);

    $('#product_addtocart_form').filter(function () {
        var data = $(this);
        //var product = parseDetails(data);  
        var category = 'Weel Cair';// 'CPAP & BiPAP Accessories/BiPAP Mashine';
        // if (_ProductListUrl.indexOf('cpap-masks') >= 0) {
        //     category = 'CPAP & Respiratory'; //'CPAP & BiPAP Accessories/CPAP & Respiratory';
        // }
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
        // product.specifications = cleanText(specificationsGet(data));
        // product.resources = downloadAndSaveImage(cleanText(resourcesGet(data)));
        // product.description = downloadAndSaveImage(cleanText(descriptionGet(data)));

        saveProduct(product);
    });
}

var downloadAndSaveImage = function (text) {
    var cheerio = require("cheerio");
    var $ = cheerio.load(text);
    var images = $('img');
    if (images.length > 0) {
        for (var i = 0; i < images.length; i++) {
            var oldUrl = $(images[i]).attr('src');
            var partsOfPath = oldUrl.split('/');
            if (partsOfPath.length > 0) {
                var imageName = partsOfPath[partsOfPath.length - 1].replace(new RegExp('%20', 'g'), '_');
                var newUrl = '/pdfs/contentImages/' + imageName
                saveImage(oldUrl, 'contentImages/' + imageName);
                text = text.replace(oldUrl, newUrl);
            }
        }
    }
    return text;
}
var pdfsWithSpacesReplace = function (html, pdfLinks) {
    if (pdfLinks.length > 0) {
        for (var i = 0; i < pdfLinks.length; i++) {
            if (pdfLinks[i].indexOf('/pdfs/') < 0) {
                var newLink = '/pdfs/' + pdfLinks[i].substring(6, pdfLinks[i].trim().length);
                html = html.replace(pdfLinks[i], newLink);
                pdfLinks[i] = newLink;
            }
            if (pdfLinks[i].indexOf('%20') >= 0) {
                var newLink = pdfLinks[i].replace(new RegExp('%20', 'g'), '_');
                html = html.replace(pdfLinks[i], newLink);
            }
        }
    }
    return html;
}
var descriptionGet = function (data) {
    var pdfList = pdfsDownload(data, 'Desc');
    var desc = data.find('span[id$="_lblDescription"]');
    if (desc != undefined && desc.length > 0) {
        var result = pdfsWithSpacesReplace(desc.html(), pdfList);
        return result;
    }
    return '';
}

var specificationsGet = function (data) {
    //var pdfList = pdfsDownload(data, 'Specs')
    var result = data.find('.product-view-sublock .specifications');
    // var specifications = 
    // var legal = data.find('#Specs .legal');
    // var panelText = panel != null && panel != undefined ? panel.html() : '';
    // var legalText = legal != null && legal != undefined ? legal.html() : '';
    // if (panelText != '' || legalText != '') {
    //     result = pdfsWithSpacesReplace('<div>' + panelText + '</div> <br/> <div>' + legalText + '</div>', pdfList);
    // }
    return result;
}
var resourcesGet = function (data) {
    var pdfList = pdfsDownload(data, 'Resources');
    var result = '';
    var res = data.find('#Resources #Resources');
    if (res.length == 0) {
        res = data.find('#Resources');
    }
    if (res.length > 0) {
        result = pdfsWithSpacesReplace(res.html(), pdfList);
    }
    return result;
}

var pdfsDownload = function (data, containerId) {
    var pdfList = []
    var anchers = data.find('#' + containerId + ' a');
    if (anchers.length > 0) {
        for (var i = 0; i < anchers.length; i++) {
            if (anchers[i].attribs != undefined &&
                anchers[i].attribs.href != undefined &&
                anchers[i].attribs.href.toLowerCase().indexOf(/pdfs/) == 0) {
                pdfUtils.downloadFile(anchers[i].attribs.href);
                pdfList.push(anchers[i].attribs.href);
            }
        }
    }
    return pdfList;
}
var CheckIfContainsImage = function (html) {
    if (html.indexOf('<img') >= 0) {
        return
    }
}
// var imgsDownload = function (data, containerId) {
//     var anchers = data.find('#' + containerId + ' img');
//     if (anchers.length > 0) {
//         for (var i = 0; i < anchers.length; i++) {
//             if (anchers[i].attribs != undefined &&
//                 anchers[i].attribs.src != undefined &&
//                 anchers[i].attribs.href.toLowerCase().indexOf(/pdfs/) == 0) {
//                 pdfUtils.downloadFile(anchers[i].attribs.href);
//             }
//         }
//     }
// }

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
}

// var creanName = function (text) {
//     if (text.indexOf('Anonymous') > 0) {
//         text = text.split('Anonymous')[0];
//     }
//     if (text.indexOf('Mask & Headgear') > 0) {
//         text = text.split('Mask & Headgear')[0].trim() + ' Mask & Headgear';
//     } else if (text.indexOf('Mask and Headgear') > 0) {
//         text = text.split('Mask and Headgear')[0].trim() + ' Mask & Headgear';
//     } else if (text.indexOf('Mask with Headgear') > 0) {
//         text = text.split('Mask with Headgear')[0].trim() + ' Mask & Headgear';
//     }
//     return cleanText(text);
// }

var isFloat = function (n) {
    if (n == '')
        return false;
    n = n.replace('$', '').trim();
    return Number(n) == n;
}
var getFloat = function (strPrice) {
    var result = 0;
    if (strPrice != '') {
        result = parseFloat(strPrice.replace('$', '').replace(',', '').trim());
    }
    return result;
}

var _totalImagesCount = 0;
var _downloadedImagesCount = 0

var imagesDownload = function (productId) {
    var imgZoomUrl = "http://www.cpapsupplyusa.com/ZoomImage.aspx?ProductId=" + productId;
    request(imgZoomUrl, function (error, response, html) {
        if (!error) {

            var $ = cheerio.load(html);
            $('#RightColumn').filter(function () {
                var data = $(this);
                var images = data.find("img");
                if (images && images.length > 0) {
                    var srcUrlParts = $(images[0]).attr('src').split('/');
                    var imageName = srcUrlParts[srcUrlParts.length - 1];
                    var product = getProduct(productId);
                    product.mainImage = imageName;
                    saveProduct(product);
                }
            })

            $('#gallery').filter(function () {
                // if (response.req.__inspector_url__.indexOf('46f3b86a-9eba-415e-ae6e-76bb6725a506') >= 0) {
                //     debugger;
                // }
                var data = $(this);
                var anchers = data.find("a");
                for (var index = 0; index < anchers.length; index++) {
                    if (index <= 4) {
                        _totalImagesCount++;
                        var url = $(anchers[index]).attr('href');
                        downloadBigImage('http://www.cpapsupplyusa.com' + url);
                    }
                }
            });
        }
    });
}

var downloadBigImage = function (zoomUrl) {
    request(zoomUrl, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('#RightColumn').filter(function () {
                var data = $(this);
                var img = data.find("img");
                var pidsp = response.request.uri.href.split('ProductId=')[1];
                if (pidsp != undefined && pidsp != '') {
                    var parts = pidsp.split('&');
                    if (parts && parts != undefined && parts.length > 0) {
                        var productId = parts[0];
                        var product = getProduct(productId);
                        var src = $(img).attr('src');
                        var srcUrlParts = src.split('/');
                        var imageName = srcUrlParts[srcUrlParts.length - 1];
                        saveImage(src, 'images/' + imageName);
                        product.images.push(imageName);
                        saveProduct(product);
                    }
                }
                _downloadedImagesCount++;
                if (_downloadedImagesCount == _totalImagesCount) {
                    if (_downloadStartedCount == _downloadCompletedCount) {
                        _lastImageParsedEmited = true;
                        _emitter.emit('theLastImageParsed');
                    } else {
                        _readyToBeEmit = true;
                    }
                }
            });
        }
    });
}
var _downloadStartedCount = 0;
var _downloadCompletedCount = 0;
var saveImage = function (uri, filepath) {
    if (!fileExists(filepath)) {
        _downloadStartedCount++;
        var file = fs.createWriteStream(filepath);
        try {
            var request = http.get("http://www.cpapsupplyusa.com" + uri, function (response) {
                response.pipe(file);
                _downloadCompletedCount++;
                if (!_lastImageParsedEmited && _readyToBeEmit) {
                    _lastImageParsedEmited = true;
                    _emitter.emit("theLastImageParsed");
                }
            });
        }
        catch (ex) {
            debugger;
        }
    }
}

function Product(category) {
    this.category = category;
    this.sku = "";
    this.name = "";
    this.price = 0;
    this.productId = "";
    this.sizeOptions = [];
    this.colors = [];
    this.sizeOprions = "";
    this.features = "";
    this.description = "";
    this.resources = "";
    this.specifications = "";
    this.brand = "";
    this.images = [];
    this.mainImage = "";
}


fillProductCategoriesLinks(_ProductListUrl);

