//  Class
var Blackjack = function () {
    this.initialize.apply(this, arguments);
};
Blackjack.prototype = (function () {
    var pro = {};

    //  Contants
    var ANIM_DELAY = 300,
        KEY_ENTER = 13,
        KEY_SPACE = 32,
        KEY_S = 83,
        KEY_D = 68,
        KEY_LEFT = 37,
        KEY_RIGHT = 39,
        KEY_UP = 38,
        KEY_DOWN = 40;

    //  Variables
    var types = ['clubs', 'diamonds', 'hearts', 'spades'],
        cards = [],
        cardsIndex = 0,
        splitBtn = $('#split-bt'),
        dealBtn = $('#bet-bt'),
        standBtn = $('#stand-bt'),
        hitBtn = $('#hit-bt'),
        doubleBtn = $('#double-bt'),
        multiplierBtn = $('#bet-multiplier'),
        dividerBtn = $('#bet-divider'),
        dCardsContainer = $('#dealer-cards'),
        dealerTotal = $('#dealer-total'),
        betAmount = $('#bet-amount'),
        balance = $('#balance'),
        pCardsContainer = [],
        playerArrow = [],
        playerTotal = [],
        playerCards = [],
        playerAces = [],
        currentBundle = 0,
        doubled = [],
        dealerCards = [],
        dealerAces = 0,
        currentBet = 0,
        isPlaying = false,
        gameDealed = false,
        canDoAction = true,
        isStanding = false,
        splitAces = false,
        gameEnded = false,
        players = [];

    //  public
    pro.initialize = function (opts) {
        initialize();
    };
    pro.restoreFromGameStates = function(userId){
        restoreFromGameStates(userId);
    };
    pro.deal = function () {
        PFShuffler.shuffle("blackjack", function(err, data){
            deal(data);
        });
    };
    pro.hit = function () {
        hit();
    };
    pro.stand = function () {
        stand();
    };
    pro.doubledown = function () {
        doubledown();
    };
    pro.split = function () {
        split();
    };

    //  private
    var initialize = function () {
        initActionButtons();
        initBet();
        initKeyboardKeys();

        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 500);
    };
    var restoreFromGameStates = function(userId) {
        gameEnded = (currentBalance === 0 || currentBalance < currentBet);

        var playGame = CONFIG.playGame;
        Utils.userDetails(userId, function(err, user){
            var gameData = user[playGame];
            if (gameData.shuffle.length) {
                isPlaying = true;
                gameDealed = true;

                disabledActionButtons();
                initPlayerBundles();
                initDeck(gameData.shuffle);

                //Dealer bundle
                dCardsContainer.append(buildCard(0, cards[0].type, cards[0].card, 'front'));
                addToDealerTotal(cards[0].value);
                dCardsContainer.append(buildCard(2, cards[2].type, cards[2].card, 'back'));
                addToDealerTotal(cards[2].value);

                //Player bundles
                players = gameData.players;
                var cnt_bundles = 0;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].length) {
                        for (var j = 0; j < players[i].length; j++) {
                            var k = Number(players[i][j]),
                                cardData = cards[k],
                                card = buildCard(k, cardData.type, cardData.card, 'front');

                            pCardsContainer[i].append(card);
                            addToPlayerTotal(cardData.value, i);

                            if (cardsIndex < k) cardsIndex = k;
                        }
                        cnt_bundles++;
                    }
                }
                cardsIndex++;
                currentBet = Number(gameData.bet);
                betAmount.val(currentBet);

                currentBundle = Number(gameData.bundle);
                showPlayerArrow(currentBundle);
                changeBankroll(-1 * (cnt_bundles));
                checkBundle();
            }
        });
    };
    var disabledActionButtons = function () {
        splitBtn.addClass('disabled');
        splitBtn.attr('disabled', true);
        doubleBtn.addClass('disabled');
        doubleBtn.attr('disabled', true);
        standBtn.addClass('disabled');
        standBtn.attr('disabled', true);
        hitBtn.addClass('disabled');
        hitBtn.attr('disabled', true);
        dealBtn.addClass('disabled');
        dealBtn.attr('disabled', true);

        multiplierBtn.addClass('disabled');
        multiplierBtn.attr('disabled', true);
        dividerBtn.addClass('disabled');
        dividerBtn.attr('disabled', true);

        betAmount.attr('disabled', true);
    };

    var initPlayerBundles = function(){
        for(var i=0; i < 4; i++){
            pCardsContainer[i] = $('#player-cards-'+(i+1));
            pCardsContainer[i].html('');

            playerArrow[i] = $('#player-arrow-'+(i+1));
            playerArrow[i].css('display', 'none');

            playerTotal[i] = $('#player-total-'+(i+1));
            playerTotal[i].html('');
            playerTotal[i].css('visibility', 'hidden');

            playerCards[i] = [];
            playerAces[i] = 0;
            players[i] = '';

            doubled[i] = false;
        }
    };
    var initActionButtons = function () {
        disabledActionButtons();
        dealBtn.removeClass('disabled');
        dealBtn.removeAttr('disabled', true);
        multiplierBtn.removeClass('disabled');
        multiplierBtn.removeAttr('disabled', true);
        dividerBtn.removeClass('disabled');
        dividerBtn.removeAttr('disabled', true);
        betAmount.removeAttr('disabled', true);
    };
    var initBet = function () {
        currentBet = betAmount.val();
        multiplierBtn.bind('click', function (){
            changeBet(currentBet*2);
        });
        dividerBtn.bind('click', function () {
            changeBet(currentBet/2);
        });
        betAmount.keyup(function(){
            this.value = this.value.replace(/[^0-9\.]/g, '');
        });
        betAmount.change(function(){
            changeBet(this.value);
        });
    };
    //  Keyboard managment
    var initKeyboardKeys = function () {
        $(document).bind('keydown', onKeyDown);
        $(document).bind('keyup', onKeyUp);
    };

    var onKeyDown = function (e) {
        switch (e.keyCode) {
            case KEY_LEFT :
                changeBet(currentBet/2);
                break;
            case KEY_RIGHT :
                changeBet(currentBet*2);
                break;
            case KEY_UP :
                changeBet(Number(currentBet)+1);
                break;
            case KEY_DOWN :
                changeBet(Number(currentBet)-1);
                break;
        }
    };
    var onKeyUp = function (e) {
        e.preventDefault();

        switch (e.keyCode) {
            case KEY_ENTER :
                if (isPlaying) {
                    hit();
                } else {
                    PFShuffler.shuffle("blackjack", function(err, data){
                        deal(data);
                    });
                }
                break;
            case KEY_SPACE :
                stand();
                break;
            case KEY_D :
                doubledown();
                break;
            case KEY_S :
                split();
                break;
        }
    };

    //  Cards management
    var initDeck = function (finalShuffle) {
        var deckString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP";
        var n = 0;
        var deck = {};
        for (var i = 0; i < types.length; i++) {
            for (var j = 1; j <= 13; j++) {
                var value = ( j > 10 ) ? 10 : j;
                deck[deckString[n++]] = { card: j, value: value, type: types[i] };
            }
        }
        for (i=0;i<finalShuffle.length;i++){
            cards.push(deck[finalShuffle[i]]);
        }
    };

    var addCard = function (side, player, bundle, callback) {
        var cardData = cards[cardsIndex],
            container = ( player == 'player' ) ? pCardsContainer[bundle] : dCardsContainer,
            card = buildCard(cardsIndex, cardData.type, cardData.card, side);

        if ( player == 'player' ) {
            players[bundle] += cardsIndex + '';
            if (CONFIG.playerId.length)
                Utils.emit('blackjack:add', {userId: CONFIG.playerId, playGame: CONFIG.playGame, bundle: currentBundle, players: players});
        }

        cardsIndex++;
        canDoAction = false;

        card.css({
            'top'   : '-500px',
            'left'  : '500px'
        });

        container.append(card);
        zIndex = card.index();
        card.css('z-index', zIndex);

        setTimeout(function(){
            card.css({
                'top'     : '0',
                'left'    : '0'
            });
            setTimeout(function () {
                if (player == 'player') addToPlayerTotal(cardData.value, bundle);
                else                    addToDealerTotal(cardData.value);

                canDoAction = true;
                if (typeof callback !== 'undefined') callback.call();
            }, ANIM_DELAY+100);
        }, 100);
    };

    var buildCard = function (id, type, value, side) {
        var card;
        var cardValue = ( value == 1 ) ? 'A' : ( value == 10 ) ? 'T' : ( value == 11 ) ? 'J' : ( value == 12 ) ? 'Q' : ( value == 13 ) ? 'K' : value,
            cardIcon = ( type == 'hearts' ) ? '♥' : ( type == 'diamonds' ) ? '♦' : ( type == 'spades' ) ? '♠' : '♣',
            corner = '<div><span class="rank">' + cardValue + '</span><span class="suit">' + cardIcon + '</span></div>',
            icons = '',
            rank = '';

        if (value <= 10) {
            icons = '<span>' + cardIcon + '</span>';
        }
        else rank = ( value == 11 ) ? 'rank-J' : ( value == 12 ) ? 'rank-Q' : ( value == 13 ) ? 'rank-K' : '';
        if (side == 'back')
            card = $('<div data-id="' + id + '" class="card ' + type + ' flipped"><div class="front"></div><div class="back '+rank+'">' + corner + '<div class="icons">' + icons + '</div></div></div>');
        else
            card = $('<div data-id="' + id + '" class="card ' + type + ' '+rank+'">' + corner + '<div class="icons">' + icons + '</div></div>');

        return card;
    };

    //  Game management
    var deal = function (finalShuffle) {
        if (CONFIG.playerId.length)
            Utils.emit('blackjack:deal', {userId: CONFIG.playerId, playGame: CONFIG.playGame, bet: currentBet, shuffle: finalShuffle});

        initPlayerBundles();
        dCardsContainer.html('');
        dealerTotal.css('visibility', 'hidden');
        dealerTotal.html('');
        $('#game-result').html('');

        if (isPlaying || !canDoAction || gameEnded){
            if (gameEnded === true){
                if (currentBet === 0)
                    Utils.showNotification("You can not bet. The wager must be between the specified boundaries.");
                else
                    Utils.showNotification("You can not bet. You have insufficient funds. Please deposit.");
            }
            return;
        }
        isPlaying = true;

        PFShuffler.bindShuffle();
        disabledActionButtons();

        if (gameDealed) {
            dealerAces = 0;
            dealerCards = [];
            cards = [];
            cardsIndex = 0;
            canDoAction = true;
            isStanding = false;
        }
        currentBundle = 0;
        initDeck(finalShuffle);
        changeBankroll(-1);
        ditributeCards();
        gameDealed = true;
    };

    var hit = function () {
        if (!isPlaying || !canDoAction || isStanding || hitBtn.hasClass('disabled') || gameEnded) return;
        var next = currentBundle + 1;
        var bundlesCount = getBundlesCount();

        addCard('front', 'player', currentBundle, function () {
            if (playerCards[currentBundle].sum() >= 21) {
                if (next < bundlesCount){
                    currentBundle = next;
                    showPlayerArrow(currentBundle);
                    checkBundle();
                }
                else{
                    disabledActionButtons();
                    revealDealerCard();
                    setTimeout(function () {
                        if (dealerCards.sum() < 17) dealerTurn();
                        else {
                            for (var i = 0; i < bundlesCount; i++) {
                                end(i);
                            }
                            stopGame();
                        }
                    }, ANIM_DELAY);
                }
            }
            else {
                splitBtn.addClass('disabled');
                splitBtn.attr('disabled', true);
                doubleBtn.addClass('disabled');
                doubleBtn.attr('disabled', true);
            }
        });
    };

    var stand = function () {
        if (!isPlaying || !canDoAction || isStanding || gameEnded) return;

        var next = currentBundle + 1;
        var bundlesCount = getBundlesCount();
        if (next < bundlesCount){
            currentBundle = next;
            showPlayerArrow(currentBundle);
            checkBundle();
        }
        else {
            disabledActionButtons();
            isStanding = true;
            revealDealerCard();

            setTimeout(function () {
                if (dealerCards.sum() < 17) dealerTurn();
                else {
                    var bundlesCount = getBundlesCount();
                    for (var i = 0;i<bundlesCount;i++){
                        end(i);
                    }
                    stopGame();
                }
            }, ANIM_DELAY);
        }
    };

    var dealerTurn = function () {
        addCard('front', 'dealer', 0, function () {
            dealerTotal.css('visibility', 'visible');
            dealerTotal.html(calculateDealerScore());

            if (dealerCards.sum() < 17) dealerTurn();
            else {
                var bundlesCount = getBundlesCount();
                for (var i = 0;i<bundlesCount;i++){
                    end(i);
                }
                stopGame();
            }
        });
    };

    var doubledown = function () {
        if (!isPlaying || !canDoAction || isStanding || doubleBtn.hasClass('disabled') || gameEnded) return;

        var next = currentBundle + 1;
        var bundlesCount = getBundlesCount();

        disabledActionButtons();
        changeBankroll(-1);
        doubled[currentBundle] = true;

        addCard('front', 'player', currentBundle, function () {
            if (playerCards[currentBundle].sum() > 21) {
                if (next < bundlesCount){
                    currentBundle = next;
                    showPlayerArrow(currentBundle);
                    checkBundle();
                }
                else{
                    revealDealerCard();
                    setTimeout(function () {
                        if (dealerCards.sum() < 17) dealerTurn();
                        else {
                            for (var i = 0; i < bundlesCount; i++) {
                                end(i);
                            }
                        }
                    }, ANIM_DELAY);
                    stopGame();
                }
            }
            else stand();
        });
    };

    var split = function(){
        if (!isPlaying || !canDoAction || isStanding || splitBtn.hasClass('disabled') || gameEnded) return;
        disabledActionButtons();
        changeBankroll(-1);
        var next = currentBundle + 1;
        var bundlesCount = getBundlesCount();
        if(next <= bundlesCount){
            for (var i= bundlesCount - 1;i >= next; i--){
                pCardsContainer[i+1].html(pCardsContainer[i].html());
                playerCards[i+1] = playerCards[i].copy();
                playerCards[i].empty();

                players[i+1] = players[i];
                players[i] = '';
            }
            pCardsContainer[next].html('');
        }

        var secondCard = pCardsContainer[currentBundle].children('.card:eq(1)').remove();
        pCardsContainer[next].append(secondCard);
        //split aces
        if (playerCards[currentBundle][0] == 1 && playerCards[currentBundle][1] == 11){
            playerCards[currentBundle][0] = 11;
        }
        playerCards[next].push(playerCards[currentBundle].pop());
        players[next] += players[currentBundle][1];
        players[currentBundle] = players[currentBundle][0];

        addCard('front', 'player', currentBundle, function () {
            addCard('front', 'player', next, function () {
                showPlayerArrow(currentBundle);
                checkBundle();
            });
        });
    };
    var checkBundle = function(){
        if (playerCards[currentBundle].length == 2) {
            doubleBtn.removeClass('disabled');
            doubleBtn.removeAttr('disabled');
        }
        standBtn.removeClass('disabled');
        standBtn.removeAttr('disabled');
        hitBtn.removeClass('disabled');
        hitBtn.removeAttr('disabled');

        if(getBundlesCount() < 4) {
            if (splitAces === true) {
                disabledActionButtons();
                standBtn.removeClass('disabled');
                standBtn.removeAttr('disabled');
            }
            if (playerCards[currentBundle][0] == playerCards[currentBundle][1]){
                splitBtn.removeClass('disabled');
                splitBtn.removeAttr('disabled');
            }
            else if (playerCards[currentBundle][0] == 1 && playerCards[currentBundle][1] == 11) {
                splitBtn.removeClass('disabled');
                splitBtn.removeAttr('disabled');
                doubleBtn.addClass('disabled');
                doubleBtn.attr('disabled', true);
                hitBtn.addClass('disabled');
                hitBtn.attr('disabled', true);
                splitAces = true;
            }
           if (currentBalance < currentBet) {
               splitBtn.addClass('disabled');
               splitBtn.attr('disabled', true);
               doubleBtn.addClass('disabled');
               doubleBtn.attr('disabled', true);
           }
        }
    };
    var showPlayerArrow = function(bundle){
        for(var i=0;i<4;i++){
            if(i == bundle)
                playerArrow[i].css('display', 'block');
            else
                playerArrow[i].css('display', 'none');
        }
    };
    var showPlayerTotal = function(){
        for(var i=0;i<4;i++){
            var pScore = calculatePlayerScore(i);
            if (pScore > 0){
                playerTotal[i].css('visibility', 'visible');
                playerTotal[i].html(pScore);
            }
            else{
                playerTotal[i].css('visibility', 'hidden');
                playerTotal[i].html('');
            }
        }
    };
    var getBundlesCount = function() {
        var bundleCount = 0;
        for (var i=0;i<4;i++){
           pScore = playerCards[i].sum();
           if (pScore > 0) bundleCount++;
        }
        return bundleCount;
    };
    var push = function (msg, bundle) {
        showMessage(msg);
        var increment = ( doubled[bundle] ) ? 2 : 1;
        changeBankroll(increment);
    };
    var win_blackjack = function(msg, bundle) {
        showMessage(msg);
        var increment = 2.5;
        changeBankroll(increment);
    };
    var win = function (msg, bundle) {
        showMessage(msg);
        var increment = ( doubled[bundle] ) ? 4 : 2;
        changeBankroll(increment);
    };

    var lose = function (msg) {
        showMessage(msg);
        changeBankroll(0);
    };
    var showMessage = function (status) {
        var msg = document.createElement('div'),
            content = '';

        msg.className = status;

        switch (status) {
            case 'win':
                content = 'WON';
                break;
            case 'lose':
                content = 'LOSE';
                break;
            case 'push':
                content = 'TIE';
                break;
            default:
                content = '<span>Something broke, don’t know what happened...</span>';
                break;
        }

        msg.innerHTML = content;
        $('#game-result').append(msg);
    };

    var end = function (bundle) {
        var pScore = playerCards[bundle].sum(),
            dScore = dealerCards.sum();

        if (pScore > 21) { lose('lose'); return; }
        if (dScore > 21) { win('win', bundle); return; }

        if (dScore > pScore) lose('lose');
        else if (pScore > dScore) win('win', bundle);
        else if (pScore == dScore) push('push', bundle);
    };

    var stopGame = function () {
        isPlaying = false;
        if (splitAces === true) splitAces = false;
        PFShuffler.setPrevShuffle();
        initActionButtons();
        gameEnded = (currentBalance === 0 || currentBalance < currentBet);
        if (CONFIG.playerId.length)
            Utils.emit("game:stop", {userId: CONFIG.playerId, playGame: CONFIG.playGame, balanceType: CONFIG.balanceType, balance: currentBalance});
    };

    var ditributeCards = function () {
        canDoAction = false;

        addCard('front', 'dealer', 0, function () {
            addCard('front', 'player', 0, function () {
                addCard('back', 'dealer', 0, function () {
                    addCard('front', 'player', 0, function () {
                        checkBlackjack();
                    });
                });
            });
        });
    };

    var checkBlackjack = function () {
        var pScore = playerCards[currentBundle].sum(),
            dScore = dealerCards.sum();

        doubleBtn.removeClass('disabled');
        doubleBtn.removeAttr('disabled');
        standBtn.removeClass('disabled');
        standBtn.removeAttr('disabled');
        hitBtn.removeClass('disabled');
        hitBtn.removeAttr('disabled');

        if (pScore == 21 && dScore == 21){
            push('push', currentBundle);
            stopGame();
        }
        else if (pScore == 21) {
            win_blackjack('win', currentBundle);
            stopGame();
        }
        else if (dScore == 21) {
            revealDealerCard();
            lose('lose');
            stopGame();
        }
        else {
            checkBundle();
        }
    };

    //  Player management
    var addToPlayerTotal = function (value, bundle) {
        if (value == 1) {
            value = 11;
            playerAces[bundle]++;
        }

        playerCards[bundle].push(value);
        showPlayerTotal();
    };

    var calculatePlayerScore = function (bundle) {
        var score = playerCards[bundle].sum();

        if (score > 21 && playerAces[bundle] > 0) {
            playerCards[bundle].splice(playerCards[bundle].indexOf(11), 1, 1);
            playerAces[bundle]--;
            score = calculatePlayerScore(bundle);
        }

        return score;
    };

    //  Dealer management
    var revealDealerCard = function () {
        var card = $('.flipped');
        card.css("-webkit-transform", "rotateY(180deg)");
        card.css("transform", "rotateY(180deg)");

        dealerTotal.css('visibility', 'visible');
        dealerTotal.html(calculateDealerScore());

        playerArrow[currentBundle].css('display', 'none');
    };

    var addToDealerTotal = function (value) {
        if (value == 1) {
            value = 11;
            dealerAces++;
        }

        dealerCards.push(value);
    };

    var calculateDealerScore = function () {
        var score = dealerCards.sum();

        if (score > 21 && dealerAces > 0) {
            dealerCards.splice(dealerCards.indexOf(11), 1, 1);
            dealerAces--;
            score = calculateDealerScore();
        }
        return score;
    };

    //  Bet management
    var changeBet = function (newValue) {
        if (isPlaying) return;
        newValue = Math.round(newValue * 1000)/1000;

        if ( newValue < minBet )
            newValue = minBet;

        var tmp = Math.min(currentBalance, maxBet);
        if ( newValue > tmp )
            newValue = tmp;

        currentBet = newValue;
        betAmount.val(currentBet);
        gameEnded = (currentBalance === 0 || currentBalance < currentBet);
    };

    var changeBankroll = function (increment) {
        currentBalance += increment * currentBet;
        balance.html(currentBalance);
    };

    return pro;
})();