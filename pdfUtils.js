var fs = require('fs');
var http = require('http');
var fileExists = require('file-exists');


exports.downloadFile = function (uri) {
    uri = uri.trim();
    var filepath = uri.replace('/PDFs/', '/pdfs/').replace('/', '').replace(new RegExp('%20', 'g'), '_');
    if (!fileExists(filepath)) {
        var file = fs.createWriteStream(filepath);

        var request = http.get("http://www.cpapsupplyusa.com" + uri, function (response) {
            try {
                response.pipe(file);
            }
            catch (ex) {
                debugger;
            }
        });
    }
}