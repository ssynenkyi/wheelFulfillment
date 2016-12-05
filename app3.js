const async = require('async'),
    csvReader = require('./csvReader'),
    csvWriter = require("./csvWriter.js"),
    jsonHandler = require('./jsonHandler'),
    productParser = require('./productParser');
var gp = require('./globalProperties');
const fs = require('fs');
const url = require('url');

const urlObjFile = 'files/urlObjectsFirstPart.txt',
    limitOfConcurrentCategories = 3,
    limitOfConcurrentProducts = 15;

let _parsedCategory = 0,
    countOfTotalParsedProducts = 0;
    countOfCategoriesToParse = 3;

function readProductsLinks(done) {
    csvReader.readProductsUrls(urlObjFile, done);
}

function parseProducts(productUrlObj, done) {
    async.mapLimit(productUrlObj, limitOfConcurrentCategories, (category, categoryIsDone) => {
        if (_parsedCategory < productUrlObj.length && _parsedCategory <= countOfCategoriesToParse) {
            _parsedCategory++;
            let productCounter = 0;

            async.mapLimit(category.products, limitOfConcurrentProducts, (product, productIsDone) => {
                countOfTotalParsedProducts++;

                let categoryUrl = url.parse(category.caregory, true, true);
				productParser.parseProduct(product, productIsDone, categoryUrl);
                console.log(`Products #${++productCounter} with url \n${product}\n was successfully parsed.`);
            }, (productErr, products) => {
                if (productErr) {
                    console.log(productErr.message);
                    categoryIsDone(productErr);
                } else {
                    console.log(`All products of category #${_parsedCategory} were successfully parsed.`);
                    categoryIsDone(null, products);
                }
            });
        } else {
            categoryIsDone(null);
        }
    }, (categoryErr, products) => {
        if (categoryErr) {
            console.log(categoryErr.message);
            done(categoryErr);
        } else {
            console.log(`All categories were successfully parsed.`);
            console.log(`Totally were parsed ${_parsedCategory} categories and ${countOfTotalParsedProducts} products.`);
            done(null, products);
        }
    });
}

function writeResultsToFile(products, done) {
    const dividedProducts = divideProductsAndUrls(products);
    jsonHandler.write('./files/imageObjects.txt', dividedProducts.images, 'Image objects were successfully saved.');

	fs.writeFileSync('files/categoriesNames.csv', gp._CategoriesNames.join(','), 'utf-8');
    fs.writeFileSync('files/Brands.csv', gp._Brands.join(','), 'utf-8');
    csvWriter.writeCsv(dividedProducts.products, 'result')


    // here should be csv writing of products

    done();
}

// TODO: refactor divideProductsAndUrls with lodash
function divideProductsAndUrls(productObj) {
    const products = [],
            images = [];

    let i, j, z;

    for (i = 0; i <= countOfCategoriesToParse; i += 1) {
        for (j = 0; j < productObj[i].length; j += 1) {
            products.push(productObj[i][j].product);
            for (z = 0; z < productObj[i][j].imageUrls.length; z++) {
                images.push(productObj[i][j].imageUrls[z]);
            }
        }
    }

    return {
        images,
        products
    };
}

function handleApp(err, res) {
    if (err) {
        console.log(err);
    } else {
        console.log('App #3 saved all images and products correctly.')
    }
}

async.waterfall([
    readProductsLinks,
    parseProducts,
    writeResultsToFile
], handleApp);
