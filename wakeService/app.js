var express = require('express')
var app = express();
app.get('/wake', function(req, res){
  res.send('Hello World' + new Date());
});
app.get('/kill', function(req, res){
  res.send('Killed');
  process.exit();
});
app.listen(process.env.PORT, process.env.IP);