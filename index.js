'use strict';
const express = require('express');
const line = require('@line/bot-sdk');
const schedule = require('node-schedule');
const http = require("http");
const fs = require('fs');
const path = require('path');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

const app = express();

app.post('/', line.middleware(config), (req, res) => {
    // req.body.events should be an array of events
    if (!Array.isArray(req.body.events)) {
        return res.status(500).end();
    }

    // handle events separately
    Promise.all(req.body.events.map(handleEvent))
        .then(() => res.end())
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// 因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//****************************以下Rich Menu相關方法不可刪除，還會用到****************************//

// 建立Rich Menu Object(3格)
var RMenu3 = {
    "size": {
        "width": 2500,
        "height": 843
    },
    "selected": false,
    "name": "TEST_3",
    "chatBarText": "選單測試",
    "areas": [
        {
            "bounds": {
                "x": 0,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "!admin",
                "text": "!admin"
            }
        },
        {
            "bounds": {
                "x": 834,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test2"
            }
        },
        {
            "bounds": {
                "x": 1668,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test3"
            }
        }
    ]
}

// 建立Rich Menu Object(6格)
var RMenu6 = {
    "size": {
        "width": 2500,
        "height": 1686
    },
    "selected": false,
    "name": "TEST_6",
    "chatBarText": "選單測試",
    "areas": [
        {
            "bounds": {
                "x": 0,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test1"
            }
        },
        {
            "bounds": {
                "x": 834,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test2"
            }
        },
        {
            "bounds": {
                "x": 1668,
                "y": 0,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test3"
            }
        },
        {
            "bounds": {
                "x": 0,
                "y": 844,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test4"
            }
        },
        {
            "bounds": {
                "x": 834,
                "y": 844,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test5"
            }
        },
        {
            "bounds": {
                "x": 1668,
                "y": 844,
                "width": 833,
                "height": 843
            },
            "action": {
                "type": "postback",
                "data": "action=test6"
            }
        }
    ]
}

// 建立Rich Menu (上限10個)
//client.createRichMenu(RMenu3).then(function (RichMenuID) {
//    console.log("Rich Menu created:" + JSON.stringify(RichMenuID));
//}).catch(function (e) {
//    console.log("createRichMenu error:" + e);
//});

// 刪除RichMenu
//var deleteRichMenuId = "richmenu-74238990b4985dfb260debb006116b6e";
//client.deleteRichMenu(deleteRichMenuId).then(function () {
//    console.log("Rich Menu deleted:" + deleteRichMenuId);
//}).catch(function (e) {
//    console.log("deleteRichMenu error:" + e);
//});

var RichMenuId = "richmenu-19a8c423f8e9a8bd55a6ac24754cb02c";

// 綁定RichMenu圖片
//const filepath = path.join(__dirname, "test3.png");
//const buffer = fs.readFileSync(filepath);
//client.setRichMenuImage(RichMenuId, buffer).then(function () {
//    console.log("setRichMenuImage seccess:" + RichMenuId);
//}).catch(function (e) {
//    console.log("setRichMenuImage error:" + e);
//});

// 取得Rich Menu List
//client.getRichMenuList().then(function (arr)
//{
//    console.log("RichMenuLists=" + JSON.stringify(arr))
//}).catch(function (e) {
//    console.log("getRichMenuList error:" + e);
//});


var RichMenuUserId = process.env.AdminLineUserId;

// 綁定RichMenuId給RichMenuUserId
//client.linkRichMenuToUser(RichMenuUserId, RichMenuId).then(function () {
//    console.log("linkRichMenuToUser seccess");
//    client.getRichMenuIdOfUser(RichMenuUserId).then(function (RichMenuId) {
//        console.log(RichMenuUserId + ".RichMenuID=" + RichMenuId);
//    }).catch(function (e) {
//        console.log("getRichMenuIdOfUser(" + RichMenuUserId + ")error:" + e);
//    });
//}).catch(function (e) {
//    console.log("linkRichMenuToUser(" + RichMenuUserId + ")error:" + e);
//});

// 排程 1次/30sec (每分鐘的5秒及35秒)
var job = schedule.scheduleJob('5,35 * * * * *', function () {
    // 設定GET RESTful API連接參數
    var paraGet = '';
    var optionsGet = {
        host: '116.50.39.201',
        port: 7102,
        path: '/LineRESTful/resources/LineRESTful' + paraGet,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    // 取得line_message_send中的待發訊息並發送
    try
    {
        http.request(optionsGet, function (resGET) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            var chunks = [];  
            var size = 0;  
            //resGET.setEncoding('utf8');
            resGET.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            resGET.on('end', function () {
                var data = null;
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
                if (data == '[]') {
                    console.log('No messages need to be sent.');
                }
                else {
                    console.log(JSON.stringify(data));
                    try {
                        var jdata = JSON.parse(data);
                        jdata.forEach(function (row) {
                            var message_id = row.message_id;
                            var line_id = row.line_id;
                            var message = row.message;
                            try {
                                var messageSend = JSON.parse(message);
                                var line_idSend = line_id.split(',');
                                console.log('message_id:' + message_id + ',line_id:' + line_idSend);
                                client.multicast(line_idSend, messageSend).then(function () {
                                    // 設定PUT RESTful API連接參數
                                    var paraPut = '?strMessageId=' + message_id;
                                    var optionsPut = {
                                        host: '116.50.39.201',
                                        port: 7102,
                                        path: '/LineRESTful/resources/LineRESTful' + paraPut,
                                        method: 'PUT'
                                    };
                                    try
                                    {
                                        // 發送後寫入actual_send_time
                                        http.request(optionsPut, function (resPUT) {
                                            resPUT.setEncoding('utf8');
                                            resPUT.on('data', function (chunkPUT) {
                                                console.log(chunkPUT);
                                            });
                                        }).end();
                                    }
                                    catch(e)
                                    {
                                        return console.log("http request fail:" + JSON.stringify(optionsPut));
                                    }
                                }).catch(function (error) {
                                    console.log(error);
                                });
                            }
                            catch (e) {
                                return console.log(e);
                            }
                        });
                    }
                    catch (e) {
                        return console.log(e);
                    }
                }
            });
        }).end();
    }
    catch(e)
    {
        return console.log("http request fail:" + JSON.stringify(optionsGet));
    }
});

// event handler
function handleEvent(event) {

    switch (event.type) {
        case 'message':
            reply(event);
            break;
        case 'postback':
            postback(event);
            break;
        case 'follow':
            follow(event);
            break;
        case 'unfollow':
            unfollow(event);
            break;
        default:
            return Promise.resolve(null);
    }
}

// 依據訊息type做出不同回應
function reply(event) {
    //client.pushMessage(event.source.userId, { type: 'text', text: displayName +'您好,\n這是Line機器人測試'}).then(function() {

    // 收到文字訊息時
    if (event.message.type == 'text') {
        if (event.message.text.toUpperCase().startsWith("V") && (event.message.text.length == 5)) {
            var msg = { type: 'text', text: '已收到您輸入的驗證碼!\n請將表單送出，\n並等待權限審核流程完成，\n謝謝!' };
            // 收到驗證碼reply
            return  client.replyMessage(event.replyToken, msg).then(function () {
                return  getDisplayName(event.source.userId).then(function (displayName) {
                    // 發送驗證資訊給管理員
                    client.pushMessage(process.env.AdminLineUserId, {
                        type: 'text', text: '*****Line推播權限申請*****\nLine暱稱：' + displayName
                        + '\n驗證碼：' + event.message.text + '\nID：' + event.source.userId
                    });
                    // 將line_id及verify_code寫入line_user_auth
                    var userInfo = { userId: event.source.userId, verifyCode: event.message.text };
                    var formData = JSON.stringify(userInfo);
                    var paraPost = '?strUserInfo=' + formData;
                    var optionsPost = {
                        host: '116.50.39.201',
                        port: 7102,
                        path: '/LineRESTful/resources/LineRESTful/LineUserAuth' + paraPost,
                        method: 'POST'
                    };
                    try {
                        http.request(optionsPost, function (resPOST) {
                            resPOST.setEncoding('utf8');
                            resPOST.on('data', function (chunkPOST) {
                                console.log(chunkPOST);
                            });
                        }).end();
                    }
                    catch (e) {
                        return console.log("http request fail:" + JSON.stringify(optionsPost));
                    }
                }).catch(function (error) {
                    // error 
                    console.log(error);
                });
            }).catch(function (error) {
                // error 
                console.log(error);
            });
        }
        else if (event.message.text === '群組管理') {
            msg = {
                "type": "imagemap",
                "baseUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/test4",
                "altText": "This is an imagemap",
                "baseSize": {
                    "height": 1040,
                    "width": 1040
                },
                "actions": [
                    {
                        "type": "message",
                        "text": "群組申請",
                        "area": {
                            "x": 0,
                            "y": 0,
                            "width": 520,
                            "height": 520
                        }
                    },
                    {
                        "type": "message",
                        "text": "群組成員查詢",
                        "area": {
                            "x": 520,
                            "y": 0,
                            "width": 1040,
                            "height": 520
                        }
                    },
                    {
                        "type": "message",
                        "text": "群組ID",
                        "area": {
                            "x": 0,
                            "y": 520,
                            "width": 520,
                            "height": 1040
                        }
                    },
                    {
                        "type": "message",
                        "text": "取消群組",
                        "area": {
                            "x": 520,
                            "y": 520,
                            "width": 1040,
                            "height": 1040
                        }
                    }
                ]
            }
            client.replyMessage(event.replyToken, msg);
        }
        else if (event.message.text === '群組成員查詢') {
            console.log(event.source.groupId);
            client.getGroupMemberIds(event.source.groupId)
                .then((ids) => {
                    console.log(event.source.groupId);
                    var allId;
                    ids.forEach((id) => allId += id + ',');
                    console.log(allId);
                    client.replyMessage(event.replyToken, { type: 'text', text: allId });
                    client.pushMessage(event.source.groupId, { type: 'text', text: allId });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else if (event.message.text == '!admin') {
            if (event.source.userId == process.env.AdminLineUserId)
            {
                msg = {
                    "type": "template",
                    "altText": "進入管理員選單",
                    "template": {
                        "type": "carousel",
                        "columns": [
                            {
                                "thumbnailImageUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/+sedum.png",
                                "title": "管理員選單1",
                                "text": "Rich Menu管理",
                                "actions": [
                                    {
                                        type: 'postback',
                                        label: 'getRichMenuList',
                                        data: 'getRichMenuList'
                                    },
                                    {
                                        type: 'datetimepicker',
                                        label: '開發中',
                                        data: 'datestring',
                                        mode: 'date'
                                    },
                                    {
                                        type: 'uri',
                                        label: '開發中',
                                        uri: 'https://www.google.com.tw/'
                                    }
                                ]
                            },
                            {
                                "thumbnailImageUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/cat.jpg",
                                "title": "管理員選單2",
                                "text": "開發中",
                                "actions": [
                                    {
                                        type: 'postback',
                                        label: '開發中',
                                        data: 'action=buy&itemid=123',
                                        text: '這是代發訊息2'
                                    },
                                    {
                                        type: 'datetimepicker',
                                        label: '開發中',
                                        data: 'datestring',
                                        mode: 'date'
                                    },
                                    {
                                        type: 'uri',
                                        label: '開發中',
                                        uri: 'https://www.google.com.tw/'
                                    }
                                ]
                            },
                            {
                                "thumbnailImageUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/difficult.png",
                                "title": "管理員選單3",
                                "text": "開發中",
                                "actions": [
                                    {
                                        type: 'postback',
                                        label: '開發中',
                                        data: 'action=buy&itemid=123',
                                        text: '這是代發訊息3'
                                    },
                                    {
                                        type: 'datetimepicker',
                                        label: '開發中',
                                        data: 'datestring',
                                        mode: 'date'
                                    },
                                    {
                                        type: 'uri',
                                        label: '開發中',
                                        uri: 'https://www.google.com.tw/'
                                    }
                                ]
                            }
                        ]
                    }
                }
                client.replyMessage(event.replyToken, msg);
            }
            else
            {
                client.pushMessage(event.source.userId, { type: 'text', text: '無法獲得管理選單，原因：非管理員' });
                console.log(event.source.userId + " 試圖進入管理員選單");
            }
        }
        else if (event.message.text == '!stop') {
            job.cancel();
            client.pushMessage(event.source.userId, { type: 'text', text: '停止發訊息排程' });
        }
        else {
            var msg = { type: 'text', text: '請輸入正確指令或驗證碼\n若有問題請洽資訊處(#1409)\n謝謝' };
            // reply
            return client.replyMessage(event.replyToken, msg).then(function () {
                // success 
                console.log(event.source.userId + " 輸入了非指令:" + event.message.text);
            }).catch(function (error) {
                // error 
                console.log(error);
            });
        }
    }

    // 收到圖片訊息時
    if (event.message.type == 'image') {
        var msg = { type: 'text', text: "您傳的這張圖片不錯喔!" };
        return client.replyMessage(event.replyToken, msg).then(function () {
            // success 
            console.log(event.message);
        }).catch(function (error) {
            // error 
            console.log(error);
        });
    }

    // 收到貼圖訊息時
    if (event.message.type == 'sticker') {
        var msg = {
            "type": "sticker",
            "packageId": "1",
            "stickerId": "13"
        };
        return client.replyMessage(event.replyToken, msg).then(function () {
            // success 
            console.log(event.message);
        }).catch(function (error) {
            // error 
            console.log(error);
        });
    }
    //})
}

// 收到postback時
function postback(event) {
    console.log("postback event=" + JSON.stringify(event));
    var msg = "";
    if (event.postback.data == "action=test1")
    {
        msg = {
            type: 'template',
            altText: 'this is a confirm template',
            template: {
                type: 'confirm',
                text: 'TEST1 為 按鈕 訊息測試',
                actions: [
                    {
                        type: 'postback',
                        label: 'Ok',
                        data: 'Ok'

                    },
                    {
                        type: 'postback',
                        label: '知道了',
                        data: '知道了'
                    }
                ]
            }
        }
        client.pushMessage(event.source.userId, msg);
    }
    else if (event.postback.data == "action=test2")
    {
        msg = {
            type: 'template',
            altText: 'this is a buttons template',
            template: {
                type: 'buttons',
                thumbnailImageUrl: 'https://s3-ap-northeast-1.amazonaws.com/chinpoon/cat.jpg',
                title: 'Menu',
                text: 'TEST2 為 圖文選單 訊息測試',
                actions: [
                    {
                        type: 'postback',
                        label: '代發訊息測試',
                        data: 'action=buy&itemid=123',
                        text: '這是代發訊息'
                    },
                    {
                        type: 'datetimepicker',
                        label: '日期選取測試',
                        data: 'datestring',
                        mode: 'date'
                    },
                    {
                        type: 'uri',
                        label: '超連結測試',
                        uri: 'https://www.google.com.tw/'
                    }
                ]
            }
        }
        client.pushMessage(event.source.userId, msg);
    }
    else if (event.postback.data == "action=test3") {
        msg = {
            "type": "template",
            "altText": "this is a carousel template",
            "template": {
                "type": "carousel",
                "columns": [
                    {
                        "thumbnailImageUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/+sedum.png",
                        "title": "選單1",
                        "text": "TEST3為輪播圖文選單測試",
                        "actions": [
                            {
                                type: 'postback',
                                label: '代發訊息測試',
                                data: 'action=buy&itemid=123',
                                text: '這是代發訊息'
                            },
                            {
                                type: 'datetimepicker',
                                label: '日期選取測試',
                                data: 'datestring',
                                mode: 'date'
                            },
                            {
                                type: 'uri',
                                label: '超連結測試',
                                uri: 'https://www.google.com.tw/'
                            }
                        ]
                    },
                    {
                        "thumbnailImageUrl": "https://s3-ap-northeast-1.amazonaws.com/chinpoon/cat.jpg",
                        "title": "選單2",
                        "text": "TEST3為輪播圖文選單測試",
                        "actions": [
                            {
                                type: 'postback',
                                label: '代發訊息測試2',
                                data: 'action=buy&itemid=123',
                                text: '這是代發訊息2'
                            },
                            {
                                type: 'datetimepicker',
                                label: '日期選取測試',
                                data: 'datestring',
                                mode: 'date'
                            },
                            {
                                type: 'uri',
                                label: '超連結測試',
                                uri: 'https://www.google.com.tw/'
                            }
                        ]
                    }
                ]
            }
        }
        client.replyMessage(event.replyToken, msg);
    }
    else if (event.postback.data == "action=test4") {

    }
    else if (event.postback.data == "action=test5") {

    }
    else if (event.postback.data == "action=test6") {

    }
    else if (event.postback.data == "datestring") {
        msg = {
            type: 'text', text: '您所挑選的日期為:' + event.postback.params.date
        };
        client.pushMessage(event.source.userId, msg);
    }
    else if (event.postback.data == "getRichMenuList")
    {
        // 取得Rich Menu List
        client.getRichMenuList().then(function (arrRichMenuList)
        {
            for (var i = 0; i < arrRichMenuList.length; i++) {
                var Id = arrRichMenuList[i].richMenuId;
                var Name = arrRichMenuList[i].name;
                var ChatBarText = arrRichMenuList[i].chatBarText;
                msg = {
                    type: 'text', text: '選單' + i + '：\nId=' + Id + '\nName=' + Name + '\nChatBarText=' + ChatBarText
                };
                client.pushMessage(event.source.userId, msg);
                console.log(JSON.stringify(msg));
            }
        }).catch(function (e) {
            console.log("getRichMenuList error:" + e);
        });
    }
}

// follow event
function follow(event) {
    console.log("follow event=" + JSON.stringify(event));
    var msg = "";
    return getDisplayName(event.source.userId).then(function (displayName) {
        // 發送新好友資訊給管理員
        client.pushMessage(process.env.AdminLineUserId, {
            type: 'text', text: '*****加入/解封通知*****\nLine暱稱：' + displayName
            + '\nID：' + event.source.userId
        });
    }).catch(function (error) {
        // error 
        console.log(error);
    });
}

// unfollow event
function unfollow(event) {
    console.log("unfollow event=" + JSON.stringify(event));
    // 發送封鎖人員資訊給管理員
    client.pushMessage(process.env.AdminLineUserId, {
        type: 'text', text: '*****封鎖/刪除通知*****\nID：' + event.source.userId
    });
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

// 取得Line暱稱
function getDisplayName(userId) {
    return client.getProfile(userId).then(function (profile) {
        return profile.displayName;
    });
}

// 維持Heroku不Sleep
setInterval(function () {
    http.get("http://cpclinebot.herokuapp.com");
    client.pushMessage(process.env.AdminLineUserId, { type: 'text', text: 'App alive' });
}, 1500000); // every 25 minutes (1500000)