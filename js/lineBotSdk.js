'use strict' //strict mode

const
    line = require('@line/bot-sdk');

//create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

//回應訊息
exports.replyMessage = function (replyToken, msg) {
    return new Promise(function (resolve, reject) {
        client.replyMessage(replyToken, msg);
        resolve(200);
    }).catch(function (e) {
        console.log('replyMessage error:' + e);
        reject('replyMessage error:' + e);
    });
}

//發送訊息
exports.pushMessage = function (lineId, msg) {
    return new Promise(function (resolve, reject) {
        client.pushMessage(lineId, msg);
        resolve(200);
    }).catch(function (e) {
        console.log('pushMessage error:' + e);
        reject('pushMessage error:' + e);
    });
}

//發送多對象訊息
exports.multicast = function (ids, msg) {
    return new Promise(function (resolve, reject) {
        client.multicast(ids, msg);
        resolve(200);
    }).catch(function (e) {
        console.log('multicast error:' + e);
        reject('multicast error:' + e);
    });
}

//取得Line暱稱
exports.getDisplayName = function (userId) {
    return new Promise(function (resolve, reject) {
        client.getProfile(userId).then(function (profile) {
            resolve(profile.displayName);
        });
    }).catch(function (e) {
        console.log('getDisplayName error:' + e);
        reject('getDisplayName error:' + e);
    });
}

//取得image, video, audio訊息中的stream資料
exports.getMessageContent = function (messageId) {
    return new Promise(function (resolve, reject) {
        client.getMessageContent(messageId).then(function (stream) {
            resolve(stream);
        });
    }).catch(function (e) {
        console.log('getMessageContent error:' + e);
        reject('getMessageContent error:' + e);
    });
}

//建立richMenu
exports.createRichMenu = function (rm) {
    return new Promise(function (resolve, reject) {
        client.createRichMenu(rm).then(function (richMenuID) {
            resolve(richMenuID);
        });
    }).catch(function (e) {
        console.log('createRichMenu error:' + e);
        reject('createRichMenu error:' + e);
    });
}

//綁定rmName.png圖片給richMenuId
exports.setRichMenuImage = function (richMenuId, buffer) {
    return new Promise(function (resolve, reject) {
        console.log('setRichMenuImage start: richMenuId=' + richMenuId);
        client.setRichMenuImage(richMenuId, buffer).then(function () {
            resolve(200);
        });
    }).catch(function (e) {
        console.log(richMenuId + ' setRichMenuImage error:' + e);
        reject(richMenuId + ' setRichMenuImage error:' + e);
    });
}

//綁定richMenuId給UserId
exports.linkRichMenuToUser = function (userId, richMenuId) {
    return new Promise(function (resolve, reject) {
        client.linkRichMenuToUser(userId, richMenuId).then(function () {
            resolve(200);
        });
    }).catch(function (e) {
        console.log(richMenuId + ' linkRichMenuToUser ' + userId + ' error:' + e);
        reject(richMenuId + ' linkRichMenuToUser ' + userId + ' error:' + e);
    });
}

//取得UserId的richMenuId
exports.getRichMenuIdOfUser = function (userId) {
    return new Promise(function (resolve, reject) {
        client.getRichMenuIdOfUser(userId).then(function (richMenuId) {
            resolve(richMenuId);
        });
    }).catch(function (e) {
        console.log('getRichMenuIdOfUser ' + userId + ' error:' + e);
        reject('getRichMenuIdOfUser ' + userId + ' error:' + e);
    });
}

//取得帳號的richMenuId清單
exports.getRichMenuList = function () {
    return new Promise(function (resolve, reject) {
        client.getRichMenuList().then(function (ids) {
            resolve(ids);
        });
    }).catch(function (e) {
        console.log('getRichMenuList error:' + e);
        reject('getRichMenuList error:' + e);
    });
}

//取得群組中成員
exports.getGroupMemberIds = function (groupId) {
    return new Promise(function (resolve, reject) {
        client.getGroupMemberIds(groupId).then(function (ids) {
            resolve(ids);
        });
    }).catch(function (e) {
        console.log('getGroupMemberIds ' + groupId + ' error:' + e);
        reject('getGroupMemberIds ' + groupId + ' error:' + e);
    });
}

//離開群組
exports.leaveGroup = function (groupId) {
    return new Promise(function (resolve, reject) {
        client.leaveGroup(groupId).then(function () {
            resolve(200);
        });
    }).catch(function (e) {
        console.log('leaveGroup ' + groupId + ' error:' + e);
        reject('leaveGroup ' + groupId + ' error:' + e);
    });
}