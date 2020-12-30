window.onload = function () {
    const useNodeJS = true;   // if you are not using a node server, set this value to false
    const defaultLiffId = "";   // change the default LIFF value if you are not using a node server
    // DO NOT CHANGE THIS
    let myLiffId = "";

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    
    if (useNodeJS) {
        fetch('/send-id')
            .then(function (reqResponse) {
                return reqResponse.json();
            })
            .then(function (jsonResponse) {
                myLiffId = jsonResponse.id;
                initializeLiffOrDie(myLiffId);
                getList();
            })
            .catch(function (error) {
                document.getElementById("liffAppContent").classList.add('hidden');
                document.getElementById("nodeLiffIdErrorMessage").classList.remove('hidden');
            });
    } else {
        myLiffId = defaultLiffId;
        initializeLiffOrDie(myLiffId);
    }
    
};

/**
* Check if myLiffId is null. If null do not initiate liff.
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiffOrDie(myLiffId) {
    if (!myLiffId) {
        document.getElementById("liffAppContent").classList.add('hidden');
        document.getElementById("liffIdErrorMessage").classList.remove('hidden');
    } else {
        initializeLiff(myLiffId);
    }
}

/**
* Initialize LIFF
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiff(myLiffId) {
    liff
        .init({
            liffId: myLiffId
        })
        .then(() => {
            // start to use LIFF's api
            initializeApp();
        })
        .catch((err) => {
            document.getElementById("liffAppContent").classList.add('hidden');
            document.getElementById("liffInitErrorMessage").classList.remove('hidden');
        });
}

/**
 * Initialize the app by calling functions handling individual app components
 */
function initializeApp() {
    displayLiffData();
    displayIsInClientInfo();
    registerButtonHandlers();

    // check if the user is logged in/out, and disable inappropriate button
    if (liff.isLoggedIn()) {
        document.getElementById('liffLoginButton').disabled = true;
    } else {
        document.getElementById('liffLogoutButton').disabled = true;
    }
}

/**
* Display data generated by invoking LIFF methods
*/
function displayLiffData() {
    document.getElementById('browserLanguage').textContent = liff.getLanguage();
    document.getElementById('sdkVersion').textContent = liff.getVersion();
    document.getElementById('lineVersion').textContent = liff.getLineVersion();
    document.getElementById('isInClient').textContent = liff.isInClient();
    document.getElementById('isLoggedIn').textContent = liff.isLoggedIn();
    document.getElementById('deviceOS').textContent = liff.getOS();
}

/**
* Toggle the login/logout buttons based on the isInClient status, and display a message accordingly
*/
function displayIsInClientInfo() {
    if (liff.isInClient()) {
        document.getElementById('liffLoginButton').classList.toggle('hidden');
        document.getElementById('liffLogoutButton').classList.toggle('hidden');
        document.getElementById('isInClientMessage').textContent = 'You are opening the app in the in-app browser of LINE.';
    } else {
        document.getElementById('isInClientMessage').textContent = 'You are opening the app in an external browser.';
    }
}

/**
* Register event handlers for the buttons displayed in the app
*/
function registerButtonHandlers() {
    // openWindow call
    document.getElementById('openWindowButton').addEventListener('click', function () {
        liff.openWindow({
            url: 'https://line.me',
            external: true
        });
    });

    // closeWindow call
    document.getElementById('closeWindowButton').addEventListener('click', function () {
        if (!liff.isInClient()) {
            sendAlertIfNotInClient();
        } else {
            liff.closeWindow();
        }
    });

    // sendMessages call
    document.getElementById('sendMessageButton').addEventListener('click', function () {
        if (!liff.isInClient()) {
            sendAlertIfNotInClient();
        } else {
            liff.sendMessages([{
                'type': 'text',
                'text': "You've successfully sent a message! Hooray!"
            }]).then(function () {
                window.alert('Message sent');
            }).catch(function (error) {
                window.alert('Error sending message: ' + error);
            });
        }
    });

    // scanCode call
    document.getElementById('scanQrCodeButton').addEventListener('click', function () {
        if (!liff.isInClient()) {
            sendAlertIfNotInClient();
        } else {
            liff.scanCode().then(result => {
                // e.g. result = { value: "Hello LIFF app!" }
                const stringifiedResult = JSON.stringify(result);
                document.getElementById('scanQrField').textContent = stringifiedResult;
                toggleQrCodeReader();
            }).catch(err => {
                document.getElementById('scanQrField').textContent = "scanCode failed!";
            });
        }
    });

    // get access token
    document.getElementById('getAccessToken').addEventListener('click', function () {
        if (!liff.isLoggedIn() && !liff.isInClient()) {
            alert('To get an access token, you need to be logged in. Please tap the "login" button below and try again.');
        } else {
            const accessToken = liff.getAccessToken();
            document.getElementById('accessTokenField').textContent = accessToken;
            toggleAccessToken();
        }
    });

    // get profile call
    document.getElementById('getProfileButton').addEventListener('click', function () {
        liff.getProfile().then(function (profile) {
            document.getElementById('userIdProfileField').textContent = profile.userId;
            document.getElementById('displayNameField').textContent = profile.displayName;

            const profilePictureDiv = document.getElementById('profilePictureDiv');
            if (profilePictureDiv.firstElementChild) {
                profilePictureDiv.removeChild(profilePictureDiv.firstElementChild);
            }
            const img = document.createElement('img');
            img.src = profile.pictureUrl;
            img.alt = 'Profile Picture';
            profilePictureDiv.appendChild(img);

            document.getElementById('statusMessageField').textContent = profile.statusMessage;
            toggleProfileData();
        }).catch(function (error) {
            window.alert('Error getting profile: ' + error);
        });
    });

    document.getElementById('shareTargetPicker').addEventListener('click', function () {
        if (!liff.isInClient()) {
            sendAlertIfNotInClient();
        } else {
            if (liff.isApiAvailable('shareTargetPicker')) {
                liff.shareTargetPicker([
                    {
                        'type': 'text',
                        'text': 'Hello, World!'
                    }
                ])
                    .then(
                        document.getElementById('shareTargetPickerMessage').textContent = "Share target picker was launched."
                    ).catch(function (res) {
                        document.getElementById('shareTargetPickerMessage').textContent = "Failed to launch share target picker.";
                    });
            }
        }
    });

    // login call, only when external browser is used
    document.getElementById('liffLoginButton').addEventListener('click', function () {
        if (!liff.isLoggedIn()) {
            // set `redirectUri` to redirect the user to a URL other than the front page of your LIFF app.
            liff.login();
        }
    });

    // logout call only when external browse
    document.getElementById('liffLogoutButton').addEventListener('click', function () {
        if (liff.isLoggedIn()) {
            liff.logout();
            window.location.reload();
        }
    });
}

/**
* Alert the user if LIFF is opened in an external browser and unavailable buttons are tapped
*/
function sendAlertIfNotInClient() {
    alert('This button is unavailable as LIFF is currently being opened in an external browser.');
}

/**
* Toggle access token data field
*/
function toggleAccessToken() {
    toggleElement('accessTokenData');
}

/**
* Toggle profile info field
*/
function toggleProfileData() {
    toggleElement('profileInfo');
}

/**
* Toggle scanCode result field
*/
function toggleQrCodeReader() {
    toggleElement('scanQr');
}

/**
* Toggle specified element
* @param {string} elementId The ID of the selected element
*/
function toggleElement(elementId) {
    const elem = document.getElementById(elementId);
    if (elem.offsetWidth > 0 && elem.offsetHeight > 0) {
        elem.style.display = 'none';
    } else {
        elem.style.display = 'block';
    }
}

async function getList() {
    //liff.getProfile().then(function (profile) {
        //var listResponse = await fetch('https://iot.chinpoon.com:21880/getNamManM/' + profile.userId)
        var listResponse = await fetch('https://iot.chinpoon.com:21880/getNamManM/1245')
        var list = await listResponse.json()
        var $table = $('#table')
        $table.bootstrapTable({ 
                data: list.result.Table,
                columns : [
                    
                ]
            })
        //點選時顯示明細
        $table.on('click-row.bs.table', function (row, $element, field) {
            //隱藏Alert
            $('#reportSuccess').hide()
            $('#reportFail').hide()
            //清空modal內容
            $('#excelDataTable').html("")
            setDetail($element)
        });
    //});
}

async function setDetail($element) {
    var lastNamManLogResponse = await fetch('https://iot.chinpoon.com:21880/getLastNamManLog/' + $element["doc_nbr"])
    var lastNamManLog = await lastNamManLogResponse.json()
    var repairReasonResponse = await fetch('https://iot.chinpoon.com:21880/getAllRepairReason')
    var repairReason = await repairReasonResponse.json()
    var rowData = $element
    var body$ = $('<tbody/>')
    Object.keys(lastNamManLog.result.Table[0]).forEach(function (key) {
        var tr$ = $('<tr/>')
        body$.append(tr$)
        switch (key) {
            case "repair_reason":
                var items = ""
                for (var i = 0; i < repairReason.result.Table.length; i++){
                    var obj = repairReason.result.Table[i];
                    items += '<a class="dropdown-item" href="#">'+ obj["reason_name"] +'</a>'
                }
                tr$.append($('<th/>').html(detailColumnName(key)));
                tr$.append($('<td/>').html('<div class="dropdown">' +
                '<button id = "btnRepairReason" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                setRepairReasonText(lastNamManLog.result.Table[0][key]) +
                '</button>' +
                '<div id="ddRepairReason" class="dropdown-menu" aria-labelledby="dropdownMenuButton">' +
                '<a class="dropdown-item" href="#">請選擇</a>' +
                items + 
                '</div>' +
                '</div>'));
                break;
            case "l_remark250":
                tr$.append($('<th/>').html(detailColumnName(key)))
                var html = '<input id="l_remark250" class="form-control" type="text" value="'
                if (lastNamManLog.result.Table[0][key][0] == '0')
                {
                    html += '">'
                }
                else
                {
                    html += lastNamManLog.result.Table[0][key][0] + '">'
                }
                tr$.append($('<td/>').html(html))
                break;
            case "repair_status":
                tr$.append($('<th/>').html(detailColumnName(key)));
                tr$.append($('<td/>').html('<div class="dropdown">' +
                '<button id = "btnRepairStatus" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                setRepairStatusText(lastNamManLog.result.Table[0][key]) +
                '</button>' +
                '<div id="ddRepairStatus" class="dropdown-menu" aria-labelledby="dropdownMenuButton">' +
                '<a class="dropdown-item" href="#">待處理</a>' +
                '<a class="dropdown-item" href="#">維修中</a>' +
                '<a class="dropdown-item" href="#">換機</a>' +
                '<a class="dropdown-item" href="#">人為損壞報賠</a>' +
                '<a class="dropdown-item" href="#">完修</a>' +
                '</div>' +
                '</div>'));
                break;
            default:
                tr$.append($('<th/>').html(detailColumnName(key)));
                tr$.append($('<td/>').html(lastNamManLog.result.Table[0][key]));
        }
    });
    $('#excelDataTable').append(body$);
    //新增下拉選單click event
    $('#ddRepairReason').on('click', 'a', function () {
        //設定下拉選單按鈕text
        document.getElementById('btnRepairReason').textContent = $(this).text();
        //更新data資料
        rowData.repair_reason = setRepairReasonValue($(this).text());
    });
    $('#l_remark250').on('input',function(e){
        rowData.l_remark250 = $(this).val();
    });
    $('#ddRepairStatus').on('click', 'a', function () {
        //設定下拉選單按鈕text
        document.getElementById('btnRepairStatus').textContent = $(this).text();
        //更新data資料
        rowData.repair_status = setRepairStatusValue($(this).text());
    });
    //清除回報按鈕click event，以避免重複新增事件
    $("#report").off("click");
    //新增回報按鈕click event
    $('#report').on('click', function(event) {
        //console.log(JSON.stringify(rowData));
        //檢查有無選擇資料
        if (document.getElementById('btnRepairReason').textContent != "請選擇" 
        && document.getElementById('btnRepairStatus').textContent != "請選擇")
        {
            liff.getProfile().then(function (profile) {
                rowData.creator = 'LINE'
                rowData.line_name = profile.displayName;
                var dateTime = Date.now();
                rowData.pk_key = Math.floor(dateTime / 1000);
                //回寫資料，顯示成功訊息
                report($element["doc_nbr"], rowData)
                $('#reportSuccess').show();
                //隱藏失敗訊息
                $('#reportFail').hide();
                //$("#detail").modal('hide');
            }).catch(err => {
                alert(err);
            });
        }
        else
        {
            //隱藏成功訊息
            $('#reportSuccess').hide();
            //顯示失敗訊息
            $('#reportFail').show();
        }
    });
    //顯示modal
    $('#detail').modal('show');
}

async function report(doc_nbr, rowData) {
    var putNamManLogResponse = await fetch('https://iot.chinpoon.com:21880/putNamManLog/' + doc_nbr, {
        method: 'PUT', // or 'PUT'
        body: JSON.stringify(rowData), // data can be `string` or {object}!
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    var putNamManLog = await putNamManLogResponse.json()
    console.log(putNamManLog)
    return putNamManLog;
}
  

function setRepairReasonText(value)
{
    if (value == 'P001')
    return "取卡紙"
    else if (value == 'P002')
    return "更換加熱棒"
    else if (value == 'P003')
    return "更換紙夾輪"
    else if (value == 'P004')
    return "更換定著"
    else if (value == 5)
    return "換上熱"
    else if (value == 6)
    return "換bk滾筒"
    else if (value == 7)
    return "安裝碳粉夾"
    else 
    return "請選擇"
}

function setRepairReasonValue(text)
{
    if (text == "取卡紙")
    return 'P001'
    else if (text == "更換加熱棒")
    return 'P002'
    else if (text == "更換紙夾輪")
    return 'P003'
    else if (text == "更換定著")
    return 'P004'
    else if (text == "換上熱")
    return 5
    else if (text == "換bk滾筒")
    return 6
    else if (text == "安裝碳粉夾")
    return 7
    else 
    return ""
}

function setRepairStatusText(value)
{
    if (value == "ES")
    return "待處理"
    else if (value == "MT")
    return "維修中"
    else if (value == "CH")
    return "換機"
    else if (value == "DM")
    return "人為損壞報賠"
    else if (value == "OK")
    return "完修"
    else 
    return "請選擇"
}

function setRepairStatusValue(text)
{
    if (text == "待處理")
    return "ES"
    else if (text == "維修中")
    return "MT"
    else if (text == "換機")
    return "CH"
    else if (text == "人為損壞報賠")
    return "DM"
    else if (text == "完修")
    return "OK"
    else 
    return ""
}

function detailColumnName(key)
{
    var name;
    switch (key) {
        case "remark250":
            name = "問題<br>說明"
            break;
        case "repair_reason":
            name = "維修<br>選項"
            break;
        case "l_remark250":
            name = "備註"
            break;
        case "repair_status":
            name = "維修<br>狀態"
            break;
        default:
    }
    return name
}