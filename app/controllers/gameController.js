var User = require('../models/user');

exports.player = function (req, res, next) {
    var userId = req.params.id;
    if ((typeof req.user == 'undefined') || (req.user.id != userId)) {
        res.redirect('/login');
    }
    else {
        res.render('game/blackjack', {page: 30});
    }
};
exports.blackjack = function (req, res, next) {
    if (typeof req.user == 'undefined') {
        if (req.query.btc == 1) {
            User.create(function (err, user) {
                if (err) {
                    return res.redirect('/');
                }
                // manually login the user once successfully signed up
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    res.redirect('/player/'+user.id);
                });
            });
        }
        else{
            res.render('game/blackjack', {page: 30});
        }
    }
    else{
        res.redirect('/player/'+req.user.id);
    }
};

exports.provably_fair = function(req, res, next){
    res.render('game/provably_fair', {page: 2, clientSeed: req.query.client_seed, hashSecret: req.query.hash_secret, serverSeed: req.query.server_seed, initialShuffle: req.query.initial_shuffle, finalShuffle: req.query.final_shuffle});
};