'use strict'//strict mode

const
    lineBotSdk = require('./lineBotSdk'),
    request = require('./request'),
    msg = require('./msg');

//群組功能處理
exports.gmHandle = function (event, data) {
    switch (data.gmName) {
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

//取得群組成員名單(測試帳號無法使用)
function gmMemberList(event) {
    lineBotSdk.getGroupMemberIds(event.source.groupId).then((memberIds) => {
        var members = '';
        request.getUrlFromJsonFile('node-RED30').then(function (url) {
            memberIds.forEach((id) => {
                if (id != 'undefined') {
                    //console.log('url:' + url + '/getUserData/' + id);
                    request.requestHttpsPost(url + '/getUserData/' + id, '', 21880).then(function (data) {
                        if (data.length > 0) {
                            members += '\n' + data.account + '(' + data.name + ')'
                        }
                    });
                }
            });
        });
        console.log(members);
        lineBotSdk.replyMessage(event.replyToken, { type: 'text', text: '群組人員：' + members });
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
                            request.requestHttpsPost(url + '/getUserData/' + id, '', 21880).then(function (data) {
                                if (data.length > 0) {
                                    noPermissionMembers += '\n' + data.account + '(' + data.name + ')'
                                }
                            });
                        }
                    });
                    lineBotSdk.pushMessage(event.source.groupId, {
                        type: 'text', text: '有' + checkUserInGroupResult.noPermission.length +
                        '位人員不在權限名單中：\n' + noPermissionMembers + '\n請將人員移出群組\n或請群組管理員於EB系統維護權限'
                    });
                }
                else {
                    lineBotSdk.pushMessage(event.source.groupId, {
                        type: 'text', text: '群組成員皆有權限'
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