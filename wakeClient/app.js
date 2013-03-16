"use strict";
var urlM = require('url');
var crypto = require('crypto');
var http = require('http');

var argv = require('optimist').usage('Usage: $0 -a [url of the service] -s [service secret] -m [mac address]')
.describe('a', 'http://wakeservice')
.describe('s', 'Your secret passphrase')
.describe('m', 'For example 11:22:33:44:55:66')
.demand(['a', 's', 'm']).argv;

var config = {
    url: urlM.parse(argv.a),
    secret: argv.s.toString(),
    mac: argv.m.toString().replace('-', ':')
};

function getWakePayload() {
    var nonce = Math.floor(Math.random() * 1000000000);
    var timestamp = (new Date().getTime());
    var dataForHash = config.mac + nonce.toString() + timestamp.toString();

    var shasum = crypto.createHmac('sha256', config.secret);
    shasum.update(dataForHash);

    var token = urlEncode(shasum.digest('base64'));

    return {
        "mac": config.mac,
        "nonce": nonce.toString(),
        "timestamp": timestamp.toString(),
        "token": token
    };
}

function urlEncode(s) {
    return encodeURIComponent(s).replace(/\%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E');
}


var post_data = JSON.stringify(getWakePayload());

var po = config.url;

po.method = 'POST';
if (!po.path || po.path.length == 0 || po.path.charAt(po.path.length - 1) != '/') po.path += '/';
po.path += 'wake';

po.method = 'POST';
po.headers = {
    'Content-Type': 'application/json',
    'Content-Length': post_data.length
};

// Set up the request
var post_req = http.request(po, function(res) {
    res.setEncoding('utf8');
    if (res.statusCode != 200)
    {
        console.log("ERROR");
    }
    
    console.log("HTTP Status: ", res.statusCode);
    console.log(" ");
    
    res.on('data', function(chunk) {
        console.log('Response: ' + chunk);
    });
});

// post the data
post_req.write(post_data);
post_req.end();
