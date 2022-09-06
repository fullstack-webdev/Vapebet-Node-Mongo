var async = require('async');
var User = require('../models/user');
var fieldValidator = require('./fieldValidator');

exports.login = function(req, res, next) {
    res.render('user/login', {page: 4});
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

exports.updateProfile = function(req, res, next) {
    var userId = req.user.id;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var repeat_password = req.body.repeat_password;

    async.waterfall([
        function checkUsername(cb){
            var validation = fieldValidator.validateUsername(username);
            if (!validation.valid) return cb(new Error(validation.message));
            User.findOne({ 'username': username, '_id': {$ne: userId} }, function(err, user) {
                if (err) return cb(err);
                if (user) return cb(new Error("The username is already taken."));
                cb();
            });
        },
        function checkPassword(cb){
            if (password && password.length) {
                var validation = fieldValidator.validatePassword(password, repeat_password);
                if (!validation.valid) return cb(new Error(validation.message));
            }
            cb();
        },
        function updateUser(cb){
            User.findById(userId, function (err, user) {
                if (err) return cb(err);
                if (!user) return cb(new Error("The user is invalid."));
                user.username = username;
                user.email = email;
                if (password && password.length) user.password = password;
                user.save(function(err) {
                    if(err) return cb(err);
                    cb(null, true);
                });
            });
        }
    ],
    function(err, result){
        if (err){
            req.flash('error', err.message);
        }
        else {
            if (result == true) {
                req.flash('success', 'Your password was succefully set.');
            }
        }
        res.redirect('/settings');
    });
};

exports.settings = function(req, res, next) {
    if (typeof req.user == 'undefined') {
        User.create(function (err, user) {
            if (err) {
                return res.redirect('/');
            }
            // manually login the user once successfully signed up
            req.logIn(user, function(err) {
                if (err) return next(err);
                return res.render('user/settings', {page: 3});
            });
        });
    }
    else{
        return res.render('user/settings', {page: 3});
    }
};

exports.userDetails = function(req, res, next) {
    var userId = req.params.id
    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user){
            res.json({success: false, error: 404, message: "User not found"});
        }
        else {
            res.json({success: true, user: user});
        }
    });
};