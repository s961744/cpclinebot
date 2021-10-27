'use strict';
const 
    line = require('@line/bot-sdk'),
    lineBotSdk = require('./js/lineBotSdk'),
    express = require('express'),
    msg = require('./js/msg'),
    postback = require('./js/postback'),
    request = require('./js/request'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    myLiffId = process.env.MY_LIFF_ID;;

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

app.use(cors())
app.use(express.static('PrinterRepair'));

app.get('/send-id', function(req, res) {
    res.json({id: myLiffId});
});

// recieve msg API
app.post('/', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  });

// keep Heroku not sleep
setInterval(function () {
    request.requestHttpGet("http://cpclinebot.herokuapp.com");
}, 1500000); // every 25 minutes (1500000)

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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// send msg API
app.post('/sendMsg', (req, res) => {
    //console.log(req.body);
    var sendMsgResult = { "ResultMsg":"", "SuccessMsg":[], "FailMsg":[] };
    if (req.body.msgData.length > 0) {
        try {
            if (req.body.msgData != null)
            {
                let promises = req.body.msgData.map(function (msg) {
                    return new Promise((resolve) => {
                        sendMsg(msg, resolve);
                      });
                });
                Promise.all(promises).then((result) => {
                    result.forEach(function(res) {
                        if (res.send)
                        {
                            sendMsgResult.SuccessMsg.push(res.message_id);
                        }
                        else
                        {
                            sendMsgResult.FailMsg.push(res.message_id);
                        }
                    });
                    sendMsgResult.ResultMsg = "Send message Done";
                    res.send(sendMsgResult);
                });
            }
            else
            {
                sendMsgResult.ResultMsg = "No Message need to send";
                res.send(sendMsgResult);
            }
        }
        catch (e) {
            sendMsgResult.ResultMsg = e;
            console.log(e);
            res.send(sendMsgResult);
        }
    }
    else {
        sendMsgResult.ResultMsg = "Message data error";
        console.log("Message data error");
        res.send(sendMsgResult);
    }
});

function sendMsg (msg, callback) {
    var result = { "message_id" : msg.message_id };
    var line_id = msg.line_id;
    var message;
    try {
        message = JSON.parse(msg.message);
    } 
    catch (e) {
        message = msg.message;
    }
    console.log("sending msg id : " + msg.message_id + ", line_id : " + line_id);
    //console.log(line_id);
    //console.log(message);
    try {
        // 訊息內容換行處理
        var messageSend = JSON.parse(jsonEscape(JSON.stringify(message)));
        // 將發送對象拆解
        var ids = line_id.split(',');
        console.log('message_id:' + msg.message_id + ',ids:' + ids);
        // 群組訊息
/*         if (ids[0].startsWith('C'))
        {
            lineBotSdk.pushMessage(ids[0], messageSend).then(function () {
                result.send = true;
                return callback(result);
            }).catch(function (e) {
                console.log(e);
                result.send = false;
                return callback(result);
            });
        }
        // 個人訊息
        else
        { */
            lineBotSdk.multicast(ids, messageSend).then(function () {
                result.send = true;
                return callback(result);
            }).catch(function (e) {
                console.log(e);
                result.send = false;
                return callback(result);
            });
        //}
    }
    catch (e) {
        console.log(e);
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