var User = require('../app/models/user');

module.exports = function(socket){
    socket.on('blackjack:add', function(data){
        User.findById(data.userId, function (err, user) {
            user[data.playGame].players = data.players;
            user[data.playGame].bundle = data.bundle;
            user.save(function(err) {
                if(!err) console.log("Card Added: "+data.players);
            });
        });
    });
    socket.on('blackjack:deal', function(data){
        User.findById(data.userId, function (err, user) {
            user[data.playGame].bet = data.bet;
            user[data.playGame].shuffle = data.shuffle;
            user.save(function(err) {
                if(!err) console.log("Blackjack dealed at: "+data.bet);
            });
        });
    });
    socket.on('game:stop', function(data){
        User.findById(data.userId, function (err, user) {
            user[data.balanceType].balance = data.balance;
            user[data.playGame].players = [];
            user[data.playGame].shuffle = '';
            user[data.playGame].bet = 0;
            user[data.playGame].bundle = 0;
            user.save(function(err) {
                if(!err) console.log("Balance: "+data.balance);
            });
        });
    });
    socket.on('disconnect', function(){
        console.log('disconnect');
    });
};