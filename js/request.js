'use strict' //strict mode

const
    urltil = require('url'),
    http = require('http'),
    https = require('https'),
    jsonProcess = require('./jsonProcess');
/**
* 處理http GET
* @param {String} url
*/
exports.requestHttpGet = function (url) {
    return new Promise(function (resolve, reject) {
        http.get(url, function (res) {
            var chunks = [], result = '', size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on('end', function () {
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
                if (data === '[]') {
                    console.log('Empty result.');
                }
                else {
                    resolve(data);
                }
            });
        }).on('error', function (err) {
            reject(err);
        });
    });
}

/**
* 處理http GET JSON 
* @param {String} url
*/
exports.requestHttpGetJson = function (url) {
    //console.log('requestHttpGetJson ' + url);
    return new Promise(function (resolve, reject) {
        http.get(url, function (res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve(JSON.parse(body));
            });
        }).on('error', function (e) {
            console.log("requestHttpGetJson error: ", e);
        });
    });
}

/**
* 處理http POST
* @param {String} url
*/
exports.requestHttpPost = function (url, data) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //設定 http.request options 傳入的參數
        var options = {
            //目標主機地址
            hostname: urlData.hostname,
            //目標地址
            path: urlData.path,
            //目標PORT
            port: urlData.port,
            //請求方法
            method: 'POST'
        };
        var req = http.request(options, function (res) {
            var buffer = [], result = '';
            //監聽data事件 接收資料
            res.on('data', function (data) {
                buffer.push(data);
            });
            //監聽end事件 完成資料的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //監聽error事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //傳入資料
        req.write(data);
        req.end();
    });
}

/**
* 處理http PUT
* @param {String} url
*/
exports.requestHttpPut = function (url, data) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //设置 https.request  options 传入的参数对象
        var options = {
            //目标主机地址
            hostname: urlData.hostname,
            //目标地址 
            path: urlData.path,
            //目标PORT 
            port: urlData.port,
            //请求方法
            method: 'PUT'
        };
        var req = http.request(options, function (res) {
            var buffer = [], result = '';
            //用于监听 data 事件 接收数据
            res.on('data', function (data) {
                buffer.push(data);
            });
            //用于监听 end 事件 完成数据的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //监听错误事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //传入数据
        req.write(data);
        req.end();
    });
}

/**
* 處理https GET
* @param {String} url
*/
exports.requestHttpsGet = function (url) {  
    return new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            var chunks = [], result = '', size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on('end', function () {
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
                if (data === '[]') {
                    console.log('Empty result.');
                }
                else {
                    resolve(data);
                }
            });
        }).on('error', function (err) {
            reject(err);
        });
    });
}

/**
* 處理https POST
* @param {String} url
* @param {String} data
* @param {Int} port
*/
exports.requestHttpsPost = function (url, data, port) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //设置 https.request  options 传入的参数对象
        var options = {
            //目标主机地址
            hostname: urlData.hostname,
            //目标地址 
            path: urlData.path,
            //请求方法
            method: 'POST',
            //PORT
            port: port,
            //略過憑證驗證
            rejectUnauthorized: false
        };
        var req = https.request(options, function (res) {
            var buffer = [], result = '';
            //用于监听 data 事件 接收数据
            res.on('data', function (data) {
                buffer.push(data);
            });
            //用于监听 end 事件 完成数据的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //监听错误事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //传入数据
        req.write(data);
        req.end();
    });
}


//get url from json file
exports.getUrlFromJsonFile = function (urlName) {
    return new Promise(function (resolve, reject) {
        var objsArray = [];
        jsonProcess.getJsonFileArrayData('url').then(function (data) {
            objsArray = JSON.parse(data)
            var obj = objsArray.filter(function (url) {
                return url.urlName == urlName;
            });
            resolve(obj[0].url);
        });
    }).catch(function (e) {
        console.log('getUrlFromJsonFile error:' + e);
        reject(e);
    });
}

