var express = require('express');
var app = express();

app.use('/', express.static('./public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/home_page.html');
});

app.get('/logged_in', function (req, res) {
  res.sendFile(__dirname + '/logged_in.html');
});

app.get('/messaging', function (req, res) {
  res.sendFile(__dirname + '/messaging.html');
});

app.listen(3000, function () {
});
