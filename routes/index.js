/**
 * Module dependencies.
 */
var appController = require('../app');
var shuffleManager = require('../app/controllers/shuffleManager');
var gameController = require('../app/controllers/gameController');
var userController = require('../app/controllers/userController');

exports.index = function (req, res, next) {
    res.render('index', {page: 1});
};

exports.setupPage = function (router, passport) {
    router.get('/provably_fair', gameController.provably_fair);
    router.get('/login', userController.login);
    router.post('/user/session',
        passport.authenticate('local', { successRedirect: '/blackjack',
                                        failureRedirect: '/login',
                                        failureFlash: true })
    );
    router.post('/user/update', userController.updateProfile);
    router.get('/logout', userController.logout);
    router.get('/settings', userController.settings);
    router.get('/blackjack', gameController.blackjack);
    router.get('/player/:id', gameController.player);
};

exports.setupAPI = function(router) {
    router.get('/', appController.index);
    router.get('/shuffle', shuffleManager.shuffledeck);
    router.get('/user/:id', userController.userDetails);
};