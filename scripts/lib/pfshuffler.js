//Provably Fair Shuffle
var lastShuffle = {clientSeed:"", hashSecret: "", serverSeed: "", initialShuffle: "", finalShuffle: ""};
var nextShuffle = {clientSeed:"", hashSecret: "", serverSeed: "", initialShuffle: "", finalShuffle: ""};

PFShuffler = {
    validate: function(clientSeed, hashSecret, serverSeed, initialShuffle, finalShuffle){
        var validations = {};

        // Verify the format of `secret`.
        validations.secret_format = serverSeed && initialShuffle ? true : false;

        // Verify that the SHA256 hash of `secret` matches the value the user saw.
        validations.hash_secret = CryptoJS.SHA256(serverSeed + initialShuffle) == hashSecret ? true : false;

        // Hash `clientSeed` and `serverSeed`.
        var seedString = CryptoJS.SHA256(clientSeed + serverSeed).toString();

        // Take the bottom 32 bits of the hash to use as the seed for the RNG.
        var seed = parseInt(seedString.substring(seedString.length - 8), 16);
        var mt = new MersenneTwister19937();
        mt.init_genrand(seed);

        var reshuffled = PFShuffler.shuffleDeck(String(initialShuffle), mt);

        validations.final_shuffle = reshuffled == finalShuffle ? true : false;

        this.render(validations);
    },
    render: function(validations) {
        var animationTime = 300, animationIndex = 1, animationClass = null;
        var key, keys = ["secret_format", "hash_secret", "final_shuffle"];
        var $verificationResult = $("#verification-result");

        $verificationResult.find("li").removeClass("failed").hide();

        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            animationClass = "." + key;
            if (!validations[key]) $verificationResult.find(animationClass).addClass("failed");
            $verificationResult.find(animationClass).delay(animationTime * animationIndex).fadeIn();
            animationIndex++;
        }

        var resultClass = validations.secret_format && validations.hash_secret && validations.final_shuffle ? ".verified" : ".not_verified";
        $verificationResult.find(resultClass).delay(animationTime * animationIndex).fadeIn();
    },
    shuffle: function(gameType, cb){
        var jqXHR=$.ajax({
            type: 'GET',
            url: '/api/v1/shuffle',
            dataType: "json",
            data: {prevShuffle: lastShuffle.finalShuffle},
            success: function(data){
                if (data.success === true){
                    var initialShuffle = nextShuffle.initialShuffle = data.initial;
                    var serverSeed = nextShuffle.serverSeed = data.seed;
                    var hashSecret = nextShuffle.hashSecret = data.secret;
                    var clientSeed = nextShuffle.clientSeed = PFShuffler.generateClientSeed();
                    var seedString = CryptoJS.SHA256(clientSeed + serverSeed).toString(CryptoJS.enc.Hex);
                    var seed = parseInt(seedString.substring(seedString.length - 8), 16);
                    var mt = new MersenneTwister19937();
                    mt.init_genrand(seed);
                    var finalShuffle = nextShuffle.finalShuffle = PFShuffler.shuffleDeck(String(initialShuffle), mt);
                    cb(null, finalShuffle);
                }
            }
        });
    },
    bindShuffle: function() {
        $('#client-seed').val(lastShuffle.clientSeed);
        $('#hash-secret').val(lastShuffle.hashSecret);
        $('#server-seed').val(lastShuffle.serverSeed);
        $('#initial-shuffle').val(lastShuffle.initialShuffle);
        $('#final-shuffle').val(lastShuffle.finalShuffle);
        $('#next-client-seed').val(nextShuffle.clientSeed);
        $('#next-hash-secret').val(nextShuffle.hashSecret);
        if (lastShuffle.clientSeed !== '')
            $('#verify-link').attr('href', '/provably_fair?client_seed='+lastShuffle.clientSeed+'&hash_secret='+lastShuffle.hashSecret+'&server_seed='+lastShuffle.serverSeed+'&initial_shuffle='+lastShuffle.initialShuffle+'&final_shuffle='+lastShuffle.finalShuffle);
    },
    decodeShuffle: function(encodedShuffle) {
        if (typeof encodedShuffle == 'undefined') return;

        var types = ['♣', '♦', '♥', '♠'],
            deckString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP",
            ret = '';
        var n = 0;
        var deck = {};
        for (var i = 0; i < types.length; i++) {
            for (var j = 1; j <= 13; j++) {
                var value = ( j == 1 ) ? 'A' : ( j == 11 ) ? 'J': ( j == 12 ) ? 'Q': ( j == 13 ) ? 'K': j+'';
                deck[deckString[n++]] = types[i]+value;
            }
        }
        for (i=0;i<encodedShuffle.length;i++){
            ret += deck[encodedShuffle[i]]+' ';
        }
        return ret;
    },
    setPrevShuffle: function(){
        for(var k in nextShuffle){
            lastShuffle[k] = nextShuffle[k];
        }
    },
    generateClientSeed: function(){
        return CryptoJS.SHA256(""+Math.random()).toString(CryptoJS.enc.Hex);
    },
    shuffleDeck: function(deckString, twister) {
        var newDeck = deckString.split("");
        newDeck = PFShuffler.fisherYatesShuffle(newDeck, twister);
        return newDeck.join("");
    },
    fisherYatesShuffle: function(collection, twister){
        var r, tmp;
        for(var i=collection.length-1;i>0;i--){
            r = twister.genrand_int32() % (i+1);
            tmp = collection[r];
            collection[r] = collection[i];
            collection[i] = tmp;
        }
        return collection;
    }
};