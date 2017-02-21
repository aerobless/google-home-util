var express = require('express');
var googlehome = require('google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8080;

var deviceName = 'Google Home';
googlehome.device(deviceName);

var urlencodedParser = bodyParser.urlencoded({extended: false});

/**
 * Used to prevent that a Google Home Notification is broadcast during the night..
 * @returns {boolean} whether it is night or not
 */
var isNight = function () {
    var currentD = new Date();
    var startNight = new Date().setHours(12, 30, 0);
    var endNight = new Date().setHours(18, 30, 0);
    return !(currentD >= startNight && currentD < endNight);
};

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    var text = req.body.text;
    if (isNight()) {
        if (text) {
            res.send(deviceName + ' will say: ' + text + '\n');
            googlehome.notify(text, function (res) {
                console.log(res);
            });
        } else {
            res.send('Please POST "text=Hello Google Home"');
        }
    } else {
        console.log("Suppressed notification because it is night!")
    }

});

app.listen(serverPort, function () {
    ngrok.connect(serverPort, function (err, url) {
        console.log('POST "text=Hello Google Home" to:');
        console.log('    http://localhost:' + serverPort + '/google-home-notifier');
        console.log('    ' + url + '/google-home-notifier');
        console.log('example:');
        console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
    });
});