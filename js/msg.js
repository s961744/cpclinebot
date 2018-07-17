'use strict' //strict mode

const
    jsonProcess = require('./jsonProcess'),
    msgTextHandler = require('./msgTextHandler'),
    msgImageHandler = require('./msgImageHandler');


//訊息處理
exports.messageHandle = function (event) {
    switch (event.message.type) {
        case 'text':
            msgTextHandler.msgTextHandle(event);
            break;
        case 'image':
            msgImageHandler.msgImageHandle(event);
            break;
        case 'video':
            break;
        case 'file':
            break;
    }
}

//依msgName從json檔案取得訊息
exports.getMsgFromJsonFile = function (fileName, msgName) {
    return new Promise(function (resolve, reject) {
        var objsArray = [];
        jsonProcess.getJsonFileArrayData(fileName).then(function (data) {
            objsArray = JSON.parse(data)
            var obj = objsArray.filter(function (msg) {
                return msg.msgName == msgName;
            });
            resolve(obj[0].msg);
        });
    }).catch(function (e) {
        console.log('getMsgFromJsonFile error:' + e);
        reject(e);
    });
}