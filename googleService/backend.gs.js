function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('ui.html');
}

function setup() {
    var secret = ScriptProperties.getProperty("wake_service_secret");
    var url = ScriptProperties.getProperty("wake_service_url");
    if (!secret || secret.length === 0 || !url || url.length == 0) {
        return {
            error: 'Please configure service_secret and service_address google script properties'
        };
    }

    return {
        mac: getMac_()
    };
}

function wake() {
    var requestRes = sendWakeRequest_(getMac_());

    if (requestRes === "OK") {
        return {};
    }
    else {
        return {
            error: requestRes
        };
    }
}

function saveSettings(settings) {
    var mac = settings.mac;

    var app = UiApp.getActiveApplication();
    var regex = new RegExp("^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$", 'i');
    if (regex.test(mac)) {
        var currentUser = Session.getActiveUser();
        ScriptProperties.setProperty(currentUser.getUserLoginId(), mac.toUpperCase());
        return {};
    }
    else {
        return {
            error: 'Wrong mac address'
        };
    }
}

function getMac_() {
    var currentUser = Session.getActiveUser();
    return ScriptProperties.getProperty(currentUser.getUserLoginId());
}

function sendWakeRequest_(mac) {
    var url = ScriptProperties.getProperty('wake_service_url');

    var options = {
        "method": "post",
        "payload": getWakePayload_(mac)
    };

    var result = UrlFetchApp.fetch(url, options);
    var resString = "";
    var rCode = result.getResponseCode();
    if (rCode == 200) {
        resString = result.getContentText();
    }
    else {
        resString = rCode.toString();
    }
    return resString;
}


function getWakePayload_(mac) {
    var secret = ScriptProperties.getProperty("wake_service_secret");
    var nonce = Math.floor(Math.random() * 1000000000);
    var timestamp = (new Date().getTime());
    var dataForHash = mac + nonce.toString() + timestamp.toString();
    var token = Utilities.base64Encode(Utilities.computeHmacSha256Signature(dataForHash, secret));

    return {
        "mac": mac,
        "nonce": nonce.toString(),
        "timestamp": timestamp.toString(),
        "token": urlEncode_(token)
    };
}

function urlEncode_(s) {
    return encodeURIComponent(s).replace(/\%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E');
}
