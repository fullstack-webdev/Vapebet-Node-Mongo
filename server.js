
/**
 * Module dependencies
 */

var express = require('express');
var database = require('./config/database');
var passport = require('passport');
var config = require('./config/config');
var routes = require('./routes');
var http = require('http');
var port = process.env.PORT || 5000;

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server, {log:false});

// Bootstrap passport config
require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport);

var router = express.Router();
routes.setupAPI(router);
app.use('/api/v1', router);

router = express.Router();
routes.setupPage(router, passport);
app.use('/', router);

app.get('*', routes.index);

//Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('API Not Found');
    err.status = 404;
    next(err);
});

//Error handlers
app.use(function(err, req, res, next) {
    if (!err) return next();
    console.error(new Date() + ' Internal error: ' + err);
//	res.status(err.status || 500);
    res.json({success:false, message:("" + err) || 'Something went wrong. Please try again later.'});
});

var socket = require('./routes/socket.js');
io.sockets.on('connection', socket);

server.listen(port);
console.log('Express app started on port ' + port);