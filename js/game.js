(function( $ ) {
    $.fn.XOGame = function() {
        var $gameContainer = $("#game"),
            firstStep;
        var methods = {
            init: function(options) {
                return this.each(function() {
                    helpers.drawGame();
                });
            },
            destroy : function( ) {
            }
        }

        var helpers = {
            drawGame: function() {
                for (var i=0; i<9; i++) {
                    $gameContainer.append("<div class='box'></div>");
                }
                helpers.initGame();
                helpers.restartGame();
            },

            initGame: function() {
                var timeout;
                $(".box")
                    .click(function() {
                        if (!$(this).html()) {
                            $(this).html(helpers.drawSymbol);
                            firstStep = !firstStep;
                        } else {
                            var $this = $(this);

                            clearTimeout(timeout);
                            $this.trigger('startRumble');
                            timeout = setTimeout(function() {
                                $this.trigger('stopRumble');
                            }, 1500);
                        }
                    })
                    .jrumble()
                ;
            },

            drawSymbol: function() {
                return firstStep ? "&#9675;" : "&#215;";
            },

            restartGame: function() {
                $("#restart").click(function() {
                    helpers.destroyGame();
                    helpers.drawGame();
                });
            },

            destroyGame: function() {
                $gameContainer.html('');
                firstStep = false;
            }
        };
        return methods.init.apply(this, arguments);
    };
})(jQuery);

$(document).ready(function() {
    $('body').XOGame();
});
