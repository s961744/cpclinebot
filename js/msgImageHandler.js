'use strict' //strict mode

const
    lineBotSdk = require('./lineBotSdk'),
    msg = require('./msg'),
    request = require('./request');

exports.msgImageHandle = function (event) {
    //msg.getMsgFromJsonFile('msg', 'imgMsgReply').then(function (msgData) {
        //lineBotSdk.replyMessage(event.replyToken, msgData).then(function () {
            lineBotSdk.getMessageContent(event.message.id).then((stream) => {
                var chunks = [];
                var size = 0;
                var data = [];
                // 取得Image content(byte[])
                stream.on('data', (chunk) => {
                    chunks.push(chunk);
                    size += chunk.length;
                })
                stream.on('error', (err) => {
                    // error handling
                })
                stream.on('end', (err) => {
                    switch (chunks.length) {
                        case 0: data = new Buffer(0);
                            break;
                        case 1: data = chunks[0];
                            break;
                        default:
                            data = new Buffer(size);
                            for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                var chunk = chunks[i];
                                chunk.copy(data, pos);
                                pos += chunk.length;
                            }
                            break;
                    }

                    //save file to Server
                    request.getUrlFromJsonFile('fileRESTful').then(function (url) {
                        var now = new Date().toISOString().
                            replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '').replace(/\s+/g, '');
                        var random = Math.floor(Math.random() * 9999) + 1;
                        var fileName = now + random + '.png';
                        var path = '/LINE/Image/';
                        console.log('uploading image:' + FileName);
                        request.requestHttpPost(url + path + fileName, data).then(function (result) {
                            //msg.getMsgFromJsonFile('msg', 'imgUploadSuccess').then(function (msg) {
                            //    lineBotSdk.pushMessage(event.source.userId, msg);
                                console.log('upload image:' + FileName + ', result' + result);
                            //});
                        });
                    });
                });
            });
            // success 
            console.log(event.message);

        //}).catch(function (error) {
            // error 
        //    console.log(error);
        //});
    //});  
}
