'use strict'//strict mode

const
    lineBotSdk = require('./lineBotSdk'),
    request = require('./request'),
    msg = require('./msg');

//群組功能處理
exports.gmHandle = function (event, data) {
    switch (data.gmName) {
        case 'gmVerify':
            gmVerify(event);
            break;
        case 'gmMemberList':
            gmMemberList(event);
            break;
        case 'gmMemberCheck':
            gmMemberCheck(event);
            break;
        case 'gmBreakConfirm':
            gmBreakConfirm(event);
            break;
    }
}

//檢查群組代號
function gmVerify(event) {
    //檢查是否已有設定群組代號
    var urlName = 'node-RED30';
    var path = '/getGroupCode/' + event.source.groupId
    request.getUrlFromJsonFile(urlName).then(function (url) {
        console.log('url:' + url + path);
        request.requestHttpsGet(url + path, 21880).then(function (data) {
            console.log('data=' + data);
            msg.getMsgFromJsonFile('msg', 'gmVerify').then(function (msgData) {
                lineBotSdk.replyMessage(event.replyToken, msgData);
            });
        });
    });
}

//取得群組成員名單(測試帳號無法使用)
function gmMemberList(event) {
    lineBotSdk.getGroupMemberIds(event.source.groupId).then((memberIds) => {
        var members = '';
        request.getUrlFromJsonFile('node-RED30').then(function (url) {
            memberIds.forEach((id) => {
                if (id != 'undefined') {
                    members += "'" + id + "',";
                }
            });
            request.requestHttpsPost(url + '/getUserData', members.slice(0, -1), 21880).then(function (membersData) {
                var returnMembers = '';
                //console.log('membersData:' + membersData);
                membersData = JSON.parse(membersData);
                for (var i = 0; i < membersData.sqlResult.length; i++)
                {
                    returnMembers += '\n' + membersData.sqlResult[i].account + '(' + membersData.sqlResult[i].name + ')';
                }
                //console.log("returnMembers:" + returnMembers);
                lineBotSdk.replyMessage(event.replyToken, { type: 'text', text: '群組人員清單查詢：' + returnMembers });
            });
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

//檢查成員是否符合權限(EB維護)
function gmMemberCheck(event) {
    lineBotSdk.getGroupMemberIds(event.source.groupId).then((memberIds) => {
       // console.log('memberIds:' + memberIds);
        request.getUrlFromJsonFile('node-RED30').then(function (url) {
            request.requestHttpsPost(url + '/checkUserInGroup/' + event.source.groupId, memberIds.join(), 21880).then(function (result) {
                //console.log('checkUserInGroup result:' + result);
                var checkUserInGroupResult = JSON.parse(result);
                if (checkUserInGroupResult.noPermission.length > 0) {
                    var noPermissionMembers = '';
                    checkUserInGroupResult.noPermission.forEach((id) => {
                        if (id != 'undefined') {
                            noPermissionMembers += "'" + id + "',";
                        }
                    });
                    request.requestHttpsPost(url + '/getUserData', noPermissionMembers.slice(0, -1), 21880).then(function (membersData) {
                        var returnMembers = '';
                        console.log('membersData:' + membersData);
                        membersData = JSON.parse(membersData);
                        for (var i = 0; i < membersData.sqlResult.length; i++) {
                            returnMembers += '\n' + membersData.sqlResult[i].account + '(' + membersData.sqlResult[i].name + ')';
                        }
                        console.log("returnMembers:" + returnMembers);
                        lineBotSdk.replyMessage(event.replyToken, {
                            type: 'text', text: '人員比對查詢：\n有' + membersData.sqlResult.length +
                            '位人員不在權限名單中：' + returnMembers + '\n請將人員移出群組\n或請群組管理員於EB系統維護權限'
                        });
                    });
                }
                else {
                    lineBotSdk.pushMessage(event.source.groupId, {
                        type: 'text', text: '人員比對查詢：\n群組成員皆有權限'
                    });
                }
            });
        }).catch(function (e) {
            return console.log('checkUserInGroup fail:' + e);
        });
    }).catch((err) => {
        console.log(err);
    });
}

//確認將Line Bot移出群組
function gmBreakConfirm(event) {
    if (event.source.userId == process.env.AdminLineUserId)
    {
        lineBotSdk.leaveGroup(event.source.groupId).then(() => {
            console.log('leaveGroup:' + event.source.groupId);
        }).catch(function (e) {
            console.log('leaveGroup error:' + e);
        });
    }
}