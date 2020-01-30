'use strict';
const
    line = require('@line/bot-sdk'),
    lineBotSdk = require('./js/lineBotSdk'),
    express = require('express'),
    schedule = require('node-schedule'),
    cp = require('child_process'),
    msg = require('./js/msg'),
    postback = require('./js/postback'),
    request = require('./js/request'),
    jsonProcess = require('./js/jsonProcess');

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

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index3.html');
});

app.get('/api/', function (req, res) {
    //console.log(req.query);
    var objsArray = [];
    jsonProcess.getJsonFileArrayData('url').then(function (data) {
        objsArray = JSON.parse(data);
        var obj = objsArray.filter(function (url) {
            return url.urlName == req.query.urlName;
        });
        var url = obj[0].url;
        var path = req.query.path;
        request.requestHttpGetJson(url + path).then(function (data) {
            res.send(data);
        });
    }).catch(function (error) {
        console.log(error);
    });
});

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

// 排程 1次/10sec
var job = schedule.scheduleJob('5,15,25,35,45,55 * * * * *', function () {
    // 取得外部Node-RED主機入口網址
    request.getUrlFromJsonFile('node-RED30').then(function (url) {
        // 取得line_message_send中的待發訊息
        request.requestHttpsGet(url + '/getMessageToSend', 21880).then(function (data) {
            if (data.length > 0) {
                //console.log(JSON.stringify(data));
                try {
                    var jdata = JSON.parse(data);
                    if (jdata.sqlResult != null)
                    {
                        jdata.sqlResult.forEach(function (row) {
                        //data.sqlResult.forEach(function (row) {
                            var message_id = row.message_id;
                            var line_id = row.line_id;
                            var message = row.message;
                            try {
                                // 將發送對象拆解
                                var messageSend = JSON.parse(jsonEscape(message));
                                var ids = line_id.split(',');
                                //console.log('message_id:' + message_id + ',ids:' + ids);
                                // 群組訊息
                                if (ids[0].startsWith('C'))
                                {
                                    lineBotSdk.getGroupMemberIds(ids[0]).then((memberIds) => {
                                        //console.log('memberIds:' + memberIds);
                                        request.getUrlFromJsonFile('node-RED30').then(function (url) {
                                            request.requestHttpsPost(url + '/checkUserInGroup/' + ids[0], memberIds.join(), 21880).then(function (result) {
                                                //console.log('checkUserInGroup result:' + result);
                                                var checkUserInGroupResult = JSON.parse(result);
                                                if (checkUserInGroupResult.noPermission.length > 0)
                                                {
                                                    lineBotSdk.pushMessage(ids[0], { type: 'text', text: '訊息發送失敗\n因有' + checkUserInGroupResult.noPermission.length +
                                                        '位人員不在權限名單中\n本訊息將延後十分鐘發送，請群組管理員儘快處理' }).then(function () {
                                                        // 延後訊息的發送時間
                                                        request.requestHttpsPut(url + '/extendSendTime/' + message_id, '', 21880);
                                                    }).catch(function (error) {
                                                        console.log(error);
                                                    });
                                                }
                                                else
                                                {
                                                    lineBotSdk.pushMessage(ids[0], messageSend).then(function () {
                                                        // 更新line_message_send的actual_send_time
                                                        request.requestHttpsPut(url + '/actualSendTime/' + message_id, '', 21880);
                                                    }).catch(function (error) {
                                                        console.log(error);
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
                                //個人訊息
                                else
                                {
                                    lineBotSdk.multicast(ids, messageSend).then(function () {
                                        // 更新line_message_send的actual_send_time
                                        request.requestHttpsPut(url + '/actualSendTime/' + message_id, '', 21880);
                                    }).catch(function (error) {
                                        console.log(error);
                                    });
                                }
                            }
                            catch (e) {
                                return console.log(e);
                            }
                        });
                    }
                }
                catch (e) {
                    return console.log(e);
                }
            }
            else {
                //console.log('No messages need to be sent.');
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

function jsonEscape(str) {
    return str.replace(/\n/g, "\\n").replace(/~n/g, "\\n");
}