
var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
    username: {type: String, default: '' },
    email: { type: String, default: '' },
    hashed_password: {type: String, default: ''},
    salt: {type: String, default: ''},
    playGame: String, //'blackjack'
    balanceType: String, //'free' or 'btc'
    currency: String, //'Play Money' or 'm฿'
    btc: {
        balance: Number,
        minBet: Number,
        maxBet: Number
    },
    free: {
        balance: Number,
        minBet: Number,
        maxBet: Number
    },
    blackjack: {
        shuffle: {type: String, default: ''},
        bet: {type: Number, default: 0},
        bundle: {type: Number, default: 0},
        players: [String]
    }
});
/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

UserSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

var randomString = function(possible, n) {
    var text = "";
    for(var i=0;i<n; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var randomIntFromInterval = function (min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

var anonymous = {
    username: function(){
        var n = randomIntFromInterval(6, 10);
        var possible = "abcdefghijklmnopqrstuvwxyz";
        var ret = randomString(possible, n);
        return ret.charAt(0).toUpperCase() + ret.slice(1);
    },
    password: function(){
        var n = randomIntFromInterval(8, 12);
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var ret = randomString(possible, n);
        return ret;
    }
};

UserSchema.statics = {
    create: function(cb){
        var user = new this({
            username: anonymous.username(),
            password: anonymous.password(),
            playGame: 'blackjack',
            balanceType: 'free',
            currency: 'Play Money',
            btc: {
                balance: 0,
                minBet: 0.01,
                maxBet: 50
            },
            free: {
                balance: 1000,
                minBet: 1,
                maxBet: 1000
            }
        });
        user.save(cb);
    }
};

module.exports = mongoose.model('User', UserSchema);