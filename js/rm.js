'use strict' //strict mode

const
    lineBotSdk = require('./lineBotSdk'),
    fs = require('fs'),
    path = require('path');

//richMenu功能處理
exports.rmHandle = function (event, data) {
    switch (data.rmName) {
        case 'rmCreate':
            rmCreate(data.rm);
            break;
        case 'rmGetList':
            rmGetList(event);
            break;
    }
}

//建立richMenu
function rmCreate(rmName) {
    return new Promise(function (resolve, reject) {
        getRichMenuData(rmName).then(function (rm) {
            lineBotSdk.createRichMenu(rm).then(function (richMenuID) {
                console.log('Rich Menu created:' + JSON.stringify(richMenuID));
                resolve(richMenuID);
            }).catch(function (e) {
                console.log('createRichMenu error:' + e);
                reject(e);
            });
        });
    });
}

//綁定rmName.png圖片給richMenuId
function rmSetImage (richMenuId, rmName) {
    return new Promise(function (resolve, reject) {
        const filepath = path.join('img', rmName + '.png');
        const buffer = fs.readFileSync(filepath);
        lineBotSdk.setRichMenuImage(richMenuId, buffer).then(function () {
            console.log('setRichMenuImage seccess:' + richMenuId);
            resolve(richMenuId);
        }).catch(function (e) {
            console.log('setRichMenuImage error:' + e);
            reject(e);
        });
    });
}

//綁定richMenuId給UserId
function rmLinkToUser (userId, richMenuId) {
    return new Promise(function (resolve, reject) {
        lineBotSdk.linkRichMenuToUser(userId, richMenuId).then(function () {
            console.log('linkRichMenuToUser seccess');
            lineBotSdk.getRichMenuIdOfUser(userId).then(function (richMenuId) {
                console.log(userId + '.RichMenuID=' + richMenuId);
                resolve(richMenuId);
            }).catch(function (e) {
                console.log('getRichMenuIdOfUser(' + userId + ')error:' + e);
                reject(e);
            });
        }).catch(function (e) {
            console.log('linkRichMenuToUser(' + userId + ')error:' + e);
            reject(e);
        });
    });
}

//依rmName取得richMenu選單內容
function getRichMenuData(rmName) {
    return new Promise(function (resolve, reject) {
        var objsArray = [];
        jsonProcess.getJsonFileArrayData('richMenu').then(function (data) {
            objsArray = JSON.parse(data)
            var obj = objsArray.filter(function (rm) {
                return rm.rmName == rmName;
            });
            resolve(obj[0].rm);
        });
    }).catch(function (e) {
        console.log('getRichMenuData error:' + e);
        reject(e);
    });
}

// 取得Rich Menu List
function rmGetList(event) {
    return new Promise(function (resolve, reject) {
        lineBotSdk.getRichMenuList().then(function (richMenuArray) {
            var allId = '';
            richMenuArray.forEach((richMenuObject) => {
                allId += '\n' + richMenuObject.richMenuId;
            });
            console.log(allId);
            lineBotSdk.replyMessage(event.replyToken, { type: 'text', text: 'RichMenu清單：' + allId });
            resolve(200);
        }).catch(function (e) {
            console.log('getRichMenuList error:' + e);
            reject(e);
        });
    });
}

// 刪除RichMenu
//var deleteRichMenuId = 'richmenu-74238990b4985dfb260debb006116b6e';
//lineBotSdk.deleteRichMenu(deleteRichMenuId).then(function () {
//    console.log('Rich Menu deleted:' + deleteRichMenuId);
//}).catch(function (e) {
//    console.log('deleteRichMenu error:' + e);
//});

//var RichMenuId = 'richmenu-19a8c423f8e9a8bd55a6ac24754cb02c';