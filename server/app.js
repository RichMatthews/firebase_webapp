var express = require('express');
var app = express();

app.use('/', express.static('./dist'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/home_page.html');
});

app.get('/logged_in', function (req, res) {
  res.sendFile(__dirname + '/logged_in.html');
});

app.listen(3000, function () {
  console.log(`app running on localhost:3000`)
});
