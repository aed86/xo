(function( $ ) {
    $.fn.XOGame = function() {
        var $gameContainer = $("#game");
        var methods = {
            init: function(options) {
                return this.each(function() {
                    helpers.drawGame();
                });
            }
        }

        var helpers = {
            drawGame: function() {
                console.log($gameContainer);
            }
        };
        return methods.init.apply(this, arguments);
    };
})(jQuery);

$(document).ready(function() {
    $('body').XOGame();
});
