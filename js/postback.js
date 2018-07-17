'use strict' //strict mode

const
    lineBotSdk = require('./lineBotSdk'),
    msg = require('./msg'),
    gm = require('./gm'),
    rm = require('./rm');

//postback處理
exports.postbackHandle = function (event) {
    return new Promise(function (resolve, reject) {
        var data = JSON.parse(event.postback.data);
        switch (data.responseType) {
            case 'msg':
                msg.getMsgFromJsonFile(data.responseType, data.msgName).then(function (msgData) {
                    lineBotSdk.replyMessage(event.replyToken, msgData);
                    resolve('postbackHandle msg done')
                });
                break;
            case 'gm':
                gm.gmHandle(event, data);
                break;
            case 'rm':
                rm.rmHandle(event, data);
                break;
        }
    });
}