var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('connected')
});

var productSchema = mongoose.Schema({
    categoryUrl: String,
    productUrl: String,
    page: String
});

var Product = mongoose.model('Product', productSchema);


var pr = new Product({
    categoryUrl: 'CategoryUrl',
    productUrl: 'ProductUrl',
    page: 'Page'
});

pr.save(function (err, fluffy) {
    if (err) return console.error(err);
    console.log(fluffy.productUrl);
});

Product.find(function (err, products) {
    if (err) return console.error(err);
    console.log(products);
})

db.close()

//console.log(silence.name); // 'Silence'