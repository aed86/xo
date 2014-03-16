(function( $ ) {
    $.fn.XOGame = function(method) {
        var CSS_MAP = {
            messageDiv: "#message",
            boxClass: "box",
            box: ".box",
            game: "#game",
            restartBtn: "#restart"
        }

        var $gameContainer = $(CSS_MAP.game),
            step,
            winCombinations = [[1,2,3], [7,8,9], [3,5,7], [1,4,7], [3,6,9], [1,5,9], [2,5,8], [4,5,6]],
            compSteps = [],
            userSteps = [],
            stopGame = false
            ;
        var methods = {
            init: function() {
                return this.each(function() {
                    helpers.drawGame();
                });
            },
            destroy : function( ) {
                $(CSS_MAP.box).unbind('click');
                userSteps =[];
                compSteps = [];
                step = false;
            }
        }

        var helpers = {
            // Рисуем поле
            drawGame: function() {
                $gameContainer.html('');
                for (var i=0; i<9; i++) {
                    $gameContainer.append("<div class='" + CSS_MAP.boxClass + "' data-index='"+ (i+1) +"'></div>");
                }
                helpers.initGame();
                helpers.restartGame();
            },

            // Инициализация игры
            initGame: function() {
                var timeout;
                compSteps = [];
                userSteps = [];
                stopGame = false;
                step = 0;
                $(CSS_MAP.messageDiv).html('');

                $(CSS_MAP.box)
                    .click(function() {
                        if (!$(this).html()) {
                            // Пользователь делает ход
                            helpers.userStep($(this));
                            // Проверяем конец игры
                            helpers.checkWin();

                            if (!stopGame) {
                                // Компьютер делает ход
                                helpers.computerStep();
                                helpers.checkWin();
                            }
                        } else {
                            // Если пользователь пытается сделать ход
                            // в уже заполненный квадрат, то потрясем :)
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

            // Проверяем, есть ли победитель
            checkWin: function() {
                var stopped = false;
                $.each([userSteps, compSteps], function(i, val) {
                    $.each(winCombinations, function(j, comb) {
                        var diff = helpers.arrayDiff(comb, val);
                        if (diff.length == 0) {
                            stopped = true;
                            $.each(comb, function(i, val) {
                                $($(CSS_MAP.box).get(val-1)).addClass('red');
                            });
                            helpers.stopGame(i == 1 ? 'comp' : 'user');
                        }
                    });
                });

                if (!stopped) {
                    // Если сделано 9 ходов, то ничья
                    if (userSteps.length + compSteps.length == 9) {
                        helpers.stopGame('draw');
                    }
                }
            },

            // Рестарт
            restartGame: function() {
                $(CSS_MAP.restartBtn).click(function() {
                    helpers.drawGame();
                });
            },

            // Игра законечена
            stopGame: function(type) {
                var message = '';

                switch (type) {
                    case "user":
                        message = "Вы выиграли!";
                        break;
                    case "comp":
                        message = "Вы проиграли";
                        break;
                    case "draw":
                        message = "Ничья";
                        break;
                }

                if (message) {
                    $(CSS_MAP.messageDiv).html(message);
                }

                stopGame = true;
                $('body').XOGame('destroy');
            },

            // Маркируем поле крестиком или ноликом
            markBox: function($obj) {
                var symbol = step ? "&#9675;" : "&#215;";
                $obj.html(symbol);
                $obj.data('type', step ? '1' : '0');
                step = !step;
            },

            // Получаем наилучшу стратегию для одного из игроков
            getStrategy: function(type) {
                var minLength = 3,
                    steps1, steps2,
                    bestCombination = [];

                if (type == "comp") {
                    steps1 = userSteps;
                    steps2 = compSteps;
                } else {
                    steps1 = compSteps;
                    steps2 = userSteps;
                }

                var possibleCombination = helpers.getPossibleCombinations(steps1);

                // Ищем подходящую комбинацию для выигрыша
                $.each(possibleCombination, function(i, comb) {
                    var diff = helpers.arrayDiff(comb, steps2);
                    if (diff.length > 0) {
                        if (minLength > diff.length) {
                            bestCombination = comb;
                            minLength = diff.length;
                        }
                    }
                });

                return {
                    bestCombination: bestCombination,
                    minLength: minLength
                }
            },

            // Компьютер делает ход
            computerStep: function() {
                var userStrategy = helpers.getStrategy('user'),
                    compStrategy = helpers.getStrategy('comp'),
                    bestCombination = [],
                    steps = []
                ;

                // Если шанс выиграть у пользователя выше, чем у компьютера, то защищаемся
                if (compSteps.length > 0 && userStrategy.minLength < compStrategy.minLength) {
                    bestCombination = userStrategy.bestCombination;
                    steps = userSteps;
                } else {
                    // Иначе пытаемся выиграть
                    bestCombination = compStrategy.bestCombination;
                    steps = compSteps;
                }

                var elm = 0;
                // Если есть выигрышная комбинация, то используем
                if (bestCombination.length > 0) {
                    var nextStepVars = helpers.arrayDiff(bestCombination, steps);
                    elm = nextStepVars[0];
                } else {
                    // Иначе делаем любой ход
                    var emptyBoxes = [];
                    $(CSS_MAP.box).each(function(i, val) {
                        var data = $(val).data('type');
                        if (data === undefined) {
                            emptyBoxes.push(i+1);
                        }
                    });

                    // Т.к. ход в центральную клетку - наиболее выигрышный, то, если она пуста, ходим туда
                    if ($.inArray(5, emptyBoxes) != -1) {
                        elm = 5;
                    } else {
                        // иначе ходим рандомно в любую клетку
                        elm = helpers.getRandomElement(emptyBoxes);
                    }
                }

                var $box = $(CSS_MAP.box).get(elm-1);
                helpers.markBox($($box));
                compSteps.push(elm);
            },

            // Получаем все комбинации, которые еще можно применить для выигрыша
            getPossibleCombinations: function (steps) {
                var pc = [];
                $.each(winCombinations, function(i, c) {
                    var diff = helpers.arrayDiff(c, steps);
                    if (diff.length == 3) {
                        pc.push(c);
                    }
                });

                return pc;
            },

            // Пользователь делает ход
            userStep: function($obj) {
                helpers.markBox($obj, 0);
                userSteps.push($obj.data('index'));
            },

            // Сравниваем массивы и возвращаем различие
            arrayDiff: function (array1, array2) {
                return $.grep(array1, function(el) { return $.inArray(el,array2) < 0 });
            },

            // Возвращает рандомный элемен массива
            getRandomElement: function(arr) {
                var totalItems = arr.length;
                var key = Math.floor(Math.random()*totalItems+1);
                return arr[key-1];
            }
        };

        // логика вызова метода
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Метод с именем ' +  method + ' не существует для jQuery.XOGame' );
        }
    };
})(jQuery);

// Поехали!
$(document).ready(function() {
    $('body').XOGame();
});
