(function( $ ) {
    $.fn.XOGame = function() {
        var $gameContainer = $("#game"),
            firstStep,
            step,
            winCombinations = [[1,2,3], [7,8,9], [3,5,7], [1,4,7], [3,6,9], [1,5,9], [2,5,8], [4,5,6]],
            compSteps = [],
            userSteps = []
            ;
        var methods = {
            init: function(options) {
                return this.each(function() {
                    helpers.drawGame();
                });
            },
            destroy : function( ) {
                $(".box").unbind();
            }
        }

        var helpers = {

            drawGame: function() {
                for (var i=0; i<9; i++) {
                    $gameContainer.append("<div class='box' data-index='"+ (i+1) +"'></div>");
                }
                helpers.initGame();
                helpers.restartGame();
            },


            initGame: function() {
                var timeout;
                $(".box")
                    .click(function() {
                        if (!$(this).html()) {
//                            helpers.markBox($(this));
                            helpers.userStep($(this));
                            helpers.checkWin(true);

                            helpers.computerStep();
                            helpers.checkWin(false);

                            firstStep = !firstStep;
                        } else {
                            var $this = $(this);

                            clearTimeout(timeout);
                            $this.trigger('startRumble');
                            timeout = setTimeout(function() {
                                $this.trigger('stopRumble');
                            }, 400);
                        }
                    })
                    .jrumble()
                ;
            },

            checkWin: function(user) {
                var combinations = [[],[]];
                $(".box").each(function(index, item) {
                    var type = $(item).data('type');
                    if (type !== undefined) {
                        combinations[type].push(index+1);
                    }
                });

                $.each(combinations, function(i, val) {
                    $.each(winCombinations, function(j, comb) {
                        var diff = helpers.arrayDiff(comb, val);
                        if (diff.length == 0) {
                            helpers.stopGame(user);
                        }
                    });
                });
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
            },

            stopGame: function(user) {
                var message = '';
                $('.box').unbind();
                if (user) {
                    message = "Congratulation, you win!";
                } else {
                    message = "You lose. :-(";
                }
                console.log(message);
            },

            markBox: function($obj) {
                var symbol = step ? "&#9675;" : "&#215;";
                $obj.html(symbol);
                $obj.data('type', step ? '1' : '0');
                step = !step;
            },

            computerStep: function() {
                var emptyBoxes = [];
                $('.box').each(function(i, val) {
                    var data = $(val).data('type');
                    if (data === undefined) {
                        emptyBoxes.push(i+1);
                    }
                });

//                console.log("COMPSTEPS:", compSteps);
//                console.log("USERSTEPS:", userSteps);

                var minCompLength = 3,
                    possibleCompCombination = getPossibleCombinations(userSteps),
                    bestCombination = [];
                console.log("POSSIBLE: ",possibleCompCombination);
                // Ищем ближайшую комбирацию для выигрыша
                $.each(possibleCompCombination, function(i, comb) {
                    var diff = helpers.arrayDiff(comb, compSteps);
                    console.log("DIFF:", diff, diff.length);
                    console.log("COMB:", comb);
                    if (diff.length > 0) {
                        if (minCompLength > diff.length) {
                            bestCombination = comb;
                            minCompLength = diff.length;
                        }
                        console.log("minl", minCompLength);
                    }
                });

                console.log("BEST:", bestCombination);
                var elm = 0;
                if (bestCombination.length > 0) {
                    var nextStepVars = helpers.arrayDiff(bestCombination, compSteps);
                    elm = nextStepVars[0];
                } else {
                    if ($.inArray(5, emptyBoxes) != -1) {
                        elm = 5;
                    } else {
                        elm = helpers.getRandomElement(emptyBoxes);
                    }
                }
                console.log("BOX:", elm);
//                var elm = emptyBoxes[0];
                var $boxToMark = $($('.box').get(elm-1));
//                console.log(emptyBoxes, elm);
                helpers.markBox($boxToMark, 1);
                compSteps.push(elm);

                function getPossibleCombinations(steps) {
                    var pc = [];
                    $.each(winCombinations, function(i, c) {
                        var diff = helpers.arrayDiff(c, steps);
                        if (diff.length == 3) {
                            pc.push(c);
                        }
                    });

                    return pc;
                }
            },

            userStep: function($obj) {
                helpers.markBox($obj, 0);
                userSteps.push($obj.data('index'));
            },

            arrayDiff: function (array1, array2) {
                return $.grep(array1, function(el) { return $.inArray(el,array2) < 0});
            },

            //Рандомное число 1 - 9
            getRandomElement: function(arr) {
                var totalItems = arr.length;
                var key = Math.floor(Math.random()*totalItems+1);
                console.log("RANDOM VALUE:", arr[key-1]);
                return arr[key-1];
            }
        };
        return methods.init.apply(this, arguments);
    };
})(jQuery);

$(document).ready(function() {
    $('body').XOGame();
});
