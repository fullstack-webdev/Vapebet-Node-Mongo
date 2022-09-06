var App = function () {
    this.initialize.apply(this, arguments);
};
App.prototype = (function () {
    var pro = {};
    pro.initialize = function () {
        var $verificationResult = $("#verification-result");
        $verificationResult.find("li").removeClass("failed").hide();

        $('#g-initial-shuffle-string').val(PFShuffler.decodeShuffle($('#g-initial-shuffle').val()));
        $('#g-final-shuffle-string').val(PFShuffler.decodeShuffle($('#g-final-shuffle').val()));
    };
    pro.verify = function(){
        verify();
    };
    var verify = function(){
        PFShuffler.validate($('#g-client-seed').val(), $('#g-hash-secret').val(), $('#g-server-seed').val(), $('#g-initial-shuffle').val(), $('#g-final-shuffle').val());
    };
    return pro;
})();