'use strict' //strict mode

const
    fs = require('fs'),
    path = require('path');

//從JSON檔案取得資料
exports.getJsonFileArrayData = function (fileName) {
    return new Promise(function (resolve, reject) {
        var fs = require('fs');
        var arr = [];
        fs.readFile('json/' + fileName + '.json', 'utf8', function (err, data) {
            if (err) reject(err);
            resolve(data);
        });
    });
}