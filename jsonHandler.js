const fs = require('fs');

module.exports = {
    read,
    write
};

function read(filename) {
    let obj;

    try {
        obj = fs.readFileSync(filename, "utf-8");
        obj = JSON.parse(obj);
    } catch (e) {
        console.log(e);
        obj = {};
    }

    return obj;
}

function write(filename, obj, msg) {
    const data = JSON.stringify(obj);

    fs.writeFile(filename, data, (err) => {
        if (err) throw err;
        console.log(msg);
    });
}