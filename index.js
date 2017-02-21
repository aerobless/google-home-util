require('log-timestamp');
var express = require('express');
var googlehome = require('google-home-notifier');
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
    var startNight = new Date().setHours(20, 30, 0);
    var endNight = new Date().setHours(8, 30, 0);
    return !(currentD >= startNight && currentD < endNight);
};

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var text = req.body.text;
    if (isNight()) {
        if (text) {
            console.log('Sending "' + text + '" to Google Home!');
            res.send(deviceName + ' will say: ' + text + '\n');
            googlehome.notify(text, function (res) {
                console.log(res);
            });
        } else {
            res.send('Please POST "text=Hello Google Home"');
        }
    } else {
        var message = 'Suppressed notification: ' + text + ' because it is night!';
        res.send(message);
        console.log(message);
    }
});

app.listen(serverPort, function () {
    console.log('-----------------------------------------------------------------------------------------');
    console.log('POST "text=Hello Google Home" to:');
    console.log('    http://localhost:' + serverPort + '/google-home-notifier');
    console.log('example:');
    console.log('curl -X POST -d "text=Hello Google Home" http://localhost:' + serverPort + '/google-home-notifier');
    console.log('-----------------------------------------------------------------------------------------');
    console.log('\n');
});