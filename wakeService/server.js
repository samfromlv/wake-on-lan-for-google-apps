'use strict';
var wol = require('wake_on_lan');
var express = require('express');
var validator = require('./validator.js');
var config = require('./config.js');

var app = express();


app.post('/wake', express.bodyParser(), function (req, res) {
	var request = {
		mac:req.body.mac,
		nonce:req.body.nonce,
		timestamp:req.body.timestamp,
		token:req.body.token
	};
	console.log(request);

	var validationResult = validator(request);
	if (!validationResult.result) {
		res.send('validation error - ' + validationResult.error);
		return;
	}

	wol.wake(request.mac, {port:config.wakePort}, function (error) {
		if (error) {
			res.send('wake error - ' + error);
		}
		else {
			res.send("OK");
		}
	});
});
app.get('/test', function (req, res) {
	res.send('ok');
});
app.listen(process.env.PORT || config.port, process.env.IP || config.ip);