"use strict";
var config = require("./config.js");
var crypto = require('crypto');
var cache = require('memory-cache');

module.exports = function(request) {
    


    function urlEncode(s) {
        return encodeURIComponent(s).replace(/\%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E');
    }

    if (!request || !request.mac || !request.nonce || !request.timestamp || !request.token) return {
        result: false,
        error: 'Missing some parameters'
    };

    var requestAgeMinutes = ((new Date()).getTime() - parseFloat(request.timestamp)) / 60000;
    if (requestAgeMinutes > config.maxRequestAgeMinutes) {
        return {
            result: false,
            error: 'Request is too old'
        }
    }
    
    if (cache.get(request.nonce))
    {
        return {
            result: false,
            error: 'Duplicate request'
        }
    }

    var toHash = request.mac + request.nonce + request.timestamp;
    var shasum = crypto.createHmac('sha256', config.secret);
    shasum.update(toHash);
    var hash = urlEncode(shasum.digest('base64'));
    var hashOk =  hash === request.token;
    if (!hashOk) return {
        result: false,
        error: 'Wrong token'
    };
    
    cache.put(request.nonce, true, config.maxRequestAgeMinutes * 60000);

    return {
        result: true
    };
}