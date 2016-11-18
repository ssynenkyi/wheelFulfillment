var writeFile = function (rowList, fileName) {
    var csv = require('csv');
    var obj = csv();
    obj.from.array(rowList).to.path('result1/' + fileName + '.csv');
    console.log('result1/' + fileName + '.csv');
}

//module.exports.csvFileWrite = csvFileWrite;
function sizeSkuGet(size, parentSku, position) {
    var sku = parentSku + position;
    var sizeParts = size.split('-');
    if (sizeParts != undefined && sizeParts.length > 1) {
        sku = sizeParts[0].trim();
    }
    return sku;
}
var IsSizeOptionCheck = exports.IsSizeOptionCheck = function (size) {
    var result = false;
    if (size && size != '') {
        var sizeString = size.replace(/\s+/g, "").toLowerCase();
        if (sizeString.indexOf('extralarge') >= 0 ||
            sizeString.indexOf('large') >= 0 ||
            sizeString.indexOf('plus') >= 0 ||
            sizeString.indexOf('medium') >= 0 ||
            sizeString.indexOf('standart') >= 0 ||
            sizeString.indexOf('standard') >= 0 ||
            sizeString.indexOf('small') >= 0 ||
            sizeString.indexOf('petite') >= 0 ||
            sizeString.indexOf('wide') >= 0 ||
            sizeString.indexOf('shallow') >= 0 ||
            sizeString.indexOf('deep') >= 0 ||
            sizeString.indexOf('airfitp10') >= 0 ||
            sizeString.indexOf('frame') >= 0) {
            result = true;
        }
    }
    return result;
}
var getSize = exports.getSize = function (size) {
    var result = '';
    if (size && size != '') {
        var sizeString = size.replace(/\s+/g, "").replace(new RegExp('-', 'g'), '').toLowerCase();
        if (sizeString.indexOf('forhersmall') >= 0) {
            result = 'for Her Small';
        } else if (sizeString.indexOf('forherextrasmall') >= 0) {
            result = 'for Her Extra Small';
        } else if (sizeString.indexOf('forhermedium') >= 0) {
            result = 'for Her Medium';
        } else if (sizeString.indexOf('largewideandextralarge') >= 0) {
            result = 'Large Wide and Extra Large';
        } else if (sizeString.indexOf('mediumwide') >= 0) {
            result = 'Medium Wide';
        } else if (sizeString.indexOf('extralarge') >= 0) {
            result = 'X-Large';
        } else if (sizeString.indexOf('largewide') >= 0) {
            result = 'Large Wide';
        } else if (sizeString.indexOf('mediumandlarge') >= 0) {
            result = 'Medium and Large';
        } else if (sizeString.indexOf('large') >= 0) {
            result = 'Large';
        } else if (sizeString.indexOf('medium') >= 0) {
            result = 'Medium';
        } else if (sizeString.indexOf('extrasmall') >= 0) {
            result = 'Extra Small';
        } else if (sizeString.indexOf('small') >= 0) {
            result = 'Small';
        } else if (sizeString.indexOf('plus') >= 0) {
            result = 'Plus';
        } else if (sizeString.indexOf('standart') >= 0 || sizeString.indexOf('standard') >= 0) {
            result = 'Standard';
        } else if (sizeString.indexOf('petite') >= 0) {
            result = 'Petite';
        } else if (sizeString.indexOf('shallowwide') >= 0) {
            result = 'Shallow Wide';
        } else if (sizeString.indexOf('wide') >= 0) {
            result = 'Wide';
        } else if (sizeString.indexOf('shallow') >= 0) {
            result = 'Shallow';
        } else if (sizeString.indexOf('deep') >= 0) {
            result = 'Deep';
        } else if (sizeString.indexOf('airfitp10forher') >= 0) {
            result = 'AirFit P10 for Her';
        } else if (sizeString.indexOf('airfitp10') >= 0) {
            result = 'AirFit P10';
        } else if (sizeString.indexOf('fabricframe') >= 0) {
            result = 'Fabric Frame';
        } else if (sizeString.indexOf('gelframe') >= 0) {
            result = 'Gel Frame';
        } else if (sizeString.indexOf('clearframe') >= 0) {
            result = 'Clear Frame';
        }
    }
    return result;
}

function oneProductRowsPrepare(product) {
    var isConfigurable = product.sizeOptions.length > 0;
    var type = isConfigurable ? 'configurable' : 'simple';
    var dateTimeNow = new Date().toLocaleDateString();
    var rows = [];
    var attributeSet = isConfigurable ? 'Configurable' : 'Default';
    var iteration = 0;
    var childSkuList = [];
    var childSizeList = [];
    while (iteration < product.sizeOptions.length) {
        var sku = sizeSkuGet(product.sizeOptions[iteration], product.sku, iteration);
        var size = getSize(product.sizeOptions[iteration]);
        var url_key = urlKeyGet(product.name + '-' + size);
        childSkuList.push(sku);
        childSizeList.push(size);
        var row = [
            product.name,
            sku + 'O',
            "simple",//type
            1, // visibility
            '',// category,
            product.brand,
            product.description,
            product.specifications,
            product.resources,
            firstImage,
            product.price,
            product.description,//short_description
            0,//weight
            999,// quantity
            attributeSet,//_attribute_set,
            1,//status,
            0,//tax_class_id
            1,//is_in_stock
            url_key,//url_key
            url_key + '.html',//url_path    
            '',// _store
            '',//_root_category
            'base',//_product_websites
            dateTimeNow,//created_at - '2016-11-07 11:01:51'
            dateTimeNow,//updated_at - '2016-11-07 11:01:51'
            'Product Info Column', //options_container
            0, //has_options - '0' or '1' cofigurable
            0, //required_options	- '0' or '1' cofigurable
            size, //size - 'Small/Medium/Large'
            firstImage,//small_image                        	
            firstImage,//thumbnail                            	
            1,//use_config_qty_increments - 1
            0,//qty_increments	- 0
            '',//_media_attribute_id	 - '' or '88'
            '',//_media_image	- '' or img
            '',//_media_position	- '', 1,2,3,4, 5
            '',//_media_is_disabled	- '', 0
            '', //_super_products_sku	- '', sku
            '', //_super_attribute_code - size 
            '', //_super_attribute_option	- small , medium, large
            ''  //_super_attribute_price_corr - ''
        ]
        rows.push(row);
        iteration++;
    }
    var firstImage = '';
    product.images = resortImages(product);
    if (product.images && product.images.length > 0) {
        firstImage = '/' + product.images[0];
    }
    // var imagesList = '';

    var url_key = urlKeyGet(product.name);
    var row = [
        product.name,
        product.sku + 'O',
        type,
        4, // visibility
        product.category,
        product.brand,
        product.description,
        product.specifications,
        product.resources,
        firstImage,
        product.price,
        product.description,//short_description
        isConfigurable ? '' : 0,//weight
        isConfigurable ? 0 : 999,// quantity
        attributeSet,//_attribute_set,
        1,//status,
        0,//tax_class_id
        1,//is_in_stock
        url_key,//url_key
        url_key + '.html',//url_path    
        '',// _store
        'Default Category',//_root_category
        'base',//_product_websites
        dateTimeNow,//created_at - '2016-11-07 11:01:51'
        dateTimeNow,//updated_at - '2016-11-07 11:01:51'
        'Product Info Column', //options_container
        isConfigurable ? 1 : 0,  //has_options - '0' or '1' cofigurable
        isConfigurable ? 1 : 0, //required_options	- '0' or '1' cofigurable
        '', //size - 'Small/Medium/Large'
        firstImage,//small_image                        	
        firstImage,//thumbnail                            	
        1,//use_config_qty_increments - 1
        0,//qty_increments	- 0
        88,//_media_attribute_id	 - '' or '88'
        firstImage,//_media_image	- '' or img
        1,//_media_position	- '', 1,2,3,4, 5
        0,//_media_is_disabled	- '', 0
        '', //todo slavik isConfigurable ? //_super_products_sku	- '', sku
        '', //todo slavik isConfigurable ? 'size' : '', // _super_attribute_code - size 
        '', //_super_attribute_option	- small , medium, large
        ''  //_super_attribute_price_corr - ''
    ];
    rows.push(row);
    const imgsCount = 5;
    var iterationIndex = 1
    while ((iterationIndex < imgsCount && iterationIndex < product.images.length) || product.sizeOptions.length >= iterationIndex) {
        var media_image = '';
        var media_attribute_id = '';
        var media_position = '';
        var media_is_disabled = '';
        if (iterationIndex < product.images.length) {
            media_image = '/' + product.images[iterationIndex];
            media_attribute_id = 88;
            media_position = iterationIndex + 1;
            media_is_disabled = 0;
        }
        var super_products_sku = '';
        var super_attribute_code = '';
        var super_attribute_option = '';
        if (childSkuList.length >= iterationIndex) {
            super_attribute_code = 'size';
            super_products_sku = childSkuList[iterationIndex - 1];
            super_attribute_option = childSizeList[iterationIndex - 1];
        }
        var row = [
            ,// product.name,
            ,//product.sku,
            , //type,
            , // visibility
            ,//product.category,
            ,//product.brand,
            ,//product.description,
            ,//product.specifications,
            ,//product.resources,
            ,//firstImage,
            ,// product.price,
            ,//product.description,//short_description
            ,//weight
            ,// quantity
            ,//_attribute_set,
            ,//status,
            ,//tax_class_id
            ,//is_in_stock
            ,//url_key
            ,//url_path    
            ,// _store
            ,//_root_category
            ,//_product_websites
            ,//created_at - '2016-11-07 11:01:51'
            ,//updated_at - '2016-11-07 11:01:51'
            , //options_container
            ,  //has_options - '0' or '1' cofigurable
            , //required_options	- '0' or '1' cofigurable
            , //size - 'Small/Medium/Large'
            ,//small_image                        	
            ,//thumbnail                            	
            ,//use_config_qty_increments - 1
            ,//qty_increments	- 0           
            media_attribute_id,//_media_attribute_id	 - '' or '88'
            media_image,//_media_image	- '' or img
            media_position,//_media_position	- '', 1,2,3,4, 5
            media_is_disabled,//_media_is_disabled	- '', 0   
            super_products_sku,  //_super_products_sku	- '', sku
            super_attribute_code,  // _super_attribute_code - size 
            super_attribute_option, //_super_attribute_option	- small , medium, large
            '' //_super_attribute_price_corr - ''
        ];
        rows.push(row);
        iterationIndex++;
    }
    return rows;
}
var urlKeyGet = function (neme) {
    var result = neme.replace(new RegExp(' ', 'g'), '-').toLowerCase();
    return result;
}
var dataPrepare = function (headers, products) {
    debugger;
    var rows = [];
    rows.push(headers);
    for (var i = 0; i < products.length; i++) {
        var oneProductRows = oneProductRowsPrepare(products[i]);
        for (var j = 0; j < oneProductRows.length; j++) {
            rows.push(oneProductRows[j]);
        }
    }
    return rows;
}


exports.writeCsv = function (products, fileName) {
    //debugger;
    var headerArray =
        [
            'name',
            'sku',
            '_type',
            'visibility',
            '_category',
            'brands',
            'description',
            'specifications',
            'features',
            'image',
            'price',
            'short_description',
            "weight",
            'qty',
            "_attribute_set",
            "status",
            "tax_class_id",
            "is_in_stock",
            "url_key",
            "url_path",
            "_store",
            "_root_category",
            "_product_websites",
            "created_at",
            "updated_at",
            "options_container",
            "has_options",
            "required_options",
            "size",
            "small_image",
            "thumbnail",
            "use_config_qty_increments",
            "qty_increments",
            "_media_attribute_id",
            "_media_image",
            "_media_position",
            "_media_is_disabled",
            "_super_products_sku",
            "_super_attribute_code",
            "_super_attribute_option",
            "_super_attribute_price_corr"
        ];

    var data = dataPrepare(headerArray, products);
    //debugger;
    writeFile(data, fileName);
}

var resortImages = function (product) {
    if (product.productId == '46f3b86a-9eba-415e-ae6e-76bb6725a506') {
        debugger;
    }
    var result = []; 
    result.push(product.mainImage);
    for (var index = 0; index < product.images.length; index++) {
        if (result.indexOf(product.images[index]) < 0) {
            result.push(product.images[index]);
        }
    }
    return result;
}