'use strict';
const
    line = require('@line/bot-sdk'),
    lineBotSdk = require('./js/lineBotSdk'),
    express = require('express'),
    schedule = require('node-schedule'),
    cp = require('child_process'),
    msg = require('./js/msg'),
    postback = require('./js/postback'),
    request = require('./js/request');

// 維持Heroku不Sleep
//setInterval(function () {
//    http.get('http://cpclinebottest.herokuapp.com');
//}, 1500000); // every 25 minutes (1500000)

//create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

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
    console.log('App now running on port', port);
});

// 排程 1次/15sec
var job = schedule.scheduleJob('5,20,35,50 * * * * *', function () {
    // 取得line_message_send中的待發訊息並發送
    request.getUrlFromJsonFile('lineRESTful').then(function (url) {
        request.requestHttpGet(url).then(function (data) {
            if (data.length < 3) {
                //console.log('No messages need to be sent.');
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
                            var ids = line_id.split(',');
                            console.log('message_id:' + message_id + ',ids:' + ids);
                            lineBotSdk.multicast(ids, messageSend).then(function () {
                                // 更新line_message_send的actual_send_time
                                var query = '?strMessageId=' + message_id;
                                request.requestHttpPut(url + query, '');
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
    }).catch(function(e) {
        return console.log('line_message_send request get fail:' + e);
    });
});

// event handler
function handleEvent(event) {
    switch (event.type) {
        case 'message':
            msg.messageHandle(event);
            break;
        case 'postback':
            postback.postbackHandle(event);
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

// follow event
function follow(event) {
    console.log('follow event=' + JSON.stringify(event));
    lineBotSdk.getDisplayName(event.source.userId).then(function (displayName) {
        // 發送新好友資訊給管理員
        lineBotSdk.pushMessage(process.env.AdminLineUserId, {
            type: 'text', text: '*****加入好友通知*****\nLine暱稱：' + displayName
            + '\nID：' + event.source.userId
        });
    }).catch(function (e) {
        console.log(e);
    });
}

// unfollow event
function unfollow(event) {
    console.log('unfollow event=' + JSON.stringify(event));
    // 發送封鎖人員資訊給管理員
    lineBotSdk.pushMessage(process.env.AdminLineUserId, {
        type: 'text', text: '*****好友封鎖/刪除通知*****\nID：' + event.source.userId
    });
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});