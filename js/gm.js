'use strict'//strict mode

const
    lineBotSdk = require('./lineBotSdk'),
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
    lineBotSdk.getGroupMemberIds(event.source.groupId).then((ids) => {
        var allId = '';
        ids.forEach((id) => {
            if (id != 'undefined') {
                allId += '\n' + id
            }
        });
        console.log(allId);
        lineBotSdk.replyMessage(event.replyToken, { type: 'text', text: '群組人員(待轉為工號+姓名)：' + allId });
    })
    .catch((err) => {
        console.log(err);
    });
}

//檢查成員是否符合EB設定
function gmMemberCheck(event) {
    
}

//確認將Line Bot移出群組
function gmBreakConfirm(event) {
    lineBotSdk.leaveGroup(event.source.groupId).then(() => {
        console.log('leaveGroup:' + event.source.groupId);
    }).catch(function (e) {
        console.log('leaveGroup error:' + e);
    });
}