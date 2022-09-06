var PAGE_HOME = 1;
var PAGE_PROVABLY_FAIR = 2;
var PAGE_SETTINGS = 3;
var PAGE_LOGIN = 4;

var PAGE_BLACKJACK = 30;

var currentBalance = 0;
var minBet = 0;
var maxBet = 0;

function main(page){
    var playerId = CONFIG.playerId;

    switch(page){
        case PAGE_HOME:
        case PAGE_PROVABLY_FAIR:
        case PAGE_SETTINGS:
        case PAGE_LOGIN:
            window.App = new App();
            break;
        case PAGE_BLACKJACK:
            currentBalance = CONFIG.balance;
            minBet = CONFIG.minBet;
            maxBet = CONFIG.maxBet;

            var blackjack = window.Blackjack = new Blackjack();
            if (!playerId.length) {
                $('#choose-mode-modal').modal({
                    keyboard: false
                });
            }
            else{
                blackjack.restoreFromGameStates(playerId);
            }
            $('#chose-btc-play').attr('href', '/'+CONFIG.playGame+'?btc=1');
            break;
    }
}