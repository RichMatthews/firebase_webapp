var express = require('express');
var app = express();
// var firebase = require('firebase');

app.use('/', express.static('./'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/home_page.html');
});

app.get('/welcome', function (req, res) {
  res.sendFile(__dirname + '/welcome.html');
});

app.listen(3000, function () {
});
