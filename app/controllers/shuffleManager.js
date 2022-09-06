//utilsHelper
var SHA256 = require('crypto-js/sha256');

var CardShuffler = function() {
    return {
        hinduShuffle: function(deck) {
            var pos = Math.floor(Math.random() * deck.length);
            var len = Math.floor(Math.random() * (deck.length - pos));
            var shuffledDeck = deck.splice(pos, len);
            return shuffledDeck.concat(deck);
        },

        riffleShuffle: function(deck) {
            var shuffledDeck = [];
            var mid = Math.floor((deck.length-1)/2);

            var pos = 1;
            for (var i = deck.length-1; i >= 0; i--) {
                if (i === mid) pos = 0;

                shuffledDeck[pos] = deck[i];
                pos = pos + 2;
            }

            return shuffledDeck;
        },

        shuffle: function(deck, n) {
            var shuffledDeck = deck;
            n = n || 5;

            for (var i = 0; i < n; i++) {
                shuffledDeck = this.riffleShuffle(shuffledDeck);
                shuffledDeck = this.hinduShuffle(shuffledDeck);
            }

            return shuffledDeck;
        },

        freshPack: function(n) {
            var deckString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP";
            var deck = [], pack;
            pack = deckString.split("");
            for (var i = 1; i <= n; i++) {
                deck = deck.concat(pack);
            }
            return deck;
        }
    };
};

var generateServerSeed = function(){
    return SHA256(""+Math.random()).toString();
};

exports.shuffledeck = function(req, res, next) {
    var newDeck, shuffledDeck, initialShuffle, prevShuffle;
    var serverSeed, hashSecret;
    var cs = new CardShuffler();

    prevShuffle = req.params.prevShuffle;
    newDeck = (typeof prevShuffle !== 'undefined') ? prevShuffle.split(""):cs.freshPack(8);

    shuffledDeck = cs.shuffle(newDeck, 5);

    serverSeed = generateServerSeed();
    initialShuffle = shuffledDeck.join("");

    hashSecret = SHA256(serverSeed + initialShuffle).toString();
    res.json({success: true, initial: initialShuffle, seed: serverSeed, secret: hashSecret});
};