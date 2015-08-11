/**
 * Sliderman v0.0.1
 * Created by Tom Davies
 * Slider-man, Slider-man. Does whatever a slider can.
 */
(function ($, undefined) {
    var initialised = false;
    var $container = $('<div class="sliderman-container"></div>');
    var $topRow = $('<div class="sliderman-top-row"></div>');
    var $middleRow = $('<div class="sliderman-middle-row"></div>');
    var $middleBuffer = $('<div class="sliderman-middle-buffer"></div>');
    var $bottomRow = $('<div class="sliderman-bottom-row"></div>');

    var activeElements = {
        top: null,
        right: null,
        bottom: null,
        left: null
    };

    function init() {
        // Add the slider container elements to body
        $('body').append($container.append($topRow).append($middleRow.append($middleBuffer)).append($bottomRow));

        // Get all elements with sliderman-main class and append to middle buffer
        $('.sliderman-main').each(function () {
           $middleBuffer.append(this);
        });

        if ($middleBuffer.children().length > 0) {
            $middleBuffer.css('pointerEvents', 'all');
        }

        initialised = true;
    }

    function getApi($element) {
        return $element.data('sliderman');
    }

    function createWrapper($element, options) {
        var positionClass = 'sliderman-' + options.position + '-panel';
        var $wrapper = $('<div class="sliderman-panel"></div>').addClass(positionClass).hide();
        var $wrapperInner = $('<div class="sliderman-panel-inner"></div>').appendTo($wrapper);
        var $toolbar = createToolbar($element, options).appendTo($wrapperInner);
        var $resizer = $('<div class="sliderman-resizer"></div>');
        $element.addClass('sliderman-panel-content').appendTo($wrapperInner);

        var hResize = function (event) {
            event.preventDefault();
            $(document).on('mousemove', move);
            $(document).on('mouseup', mouseUp);
        };

        var vResize = function (event) {
            event.preventDefault();
            $(document).on('mousemove', move);
            $(document).on('mouseup', mouseUp);
        };

        var mouseUp = function (event) {
            event.preventDefault();
            $(document).unbind('mousemove', move);
            $(document).unbind('mouseup', mouseUp);
        };

        var move = function (event) {
            event.preventDefault();
            var x = event.pageX > 0 ? event.pageX : 0;
            var y = event.pageY > 0 ? event.pageY : 0;
            var w = $(document).width();
            var h = $(document).height();
            var pos;

            if (options.position === 'left' || options.position === 'right') {
                pos = (x / w) * 100;

                if (options.position === 'right') {
                    pos = Math.min(100 - pos, 50);
                } else {
                    pos = Math.min(pos, 50);
                }

                $wrapper.css('width', pos + '%');
            }

            if (options.position === 'top' || options.position === 'bottom') {
                pos = ((h - y) / h) * 100;

                if (options.position === 'top') {
                    pos = Math.min(100 - pos, 50);
                    $topRow.css('height', pos + '%');
                } else {
                    pos = Math.min(pos, 50);
                    $bottomRow.css('height', pos + '%');
                }
            }
        };

        // Move element into container
        if (options.position === 'right') {
            $resizer.prependTo($wrapper);
            $resizer.on('mousedown', hResize);
            $wrapper.appendTo($middleRow);
        } else if (options.position === 'left') {
            $resizer.appendTo($wrapper);
            $resizer.on('mousedown', hResize);
            $wrapper.prependTo($middleRow);
        } else if (options.position === 'top') {
            $resizer.appendTo($wrapper);
            $resizer.on('mousedown', vResize);
            $wrapper.appendTo($topRow);
        } else if (options.position === 'bottom') {
            $resizer.prependTo($wrapper);
            $resizer.on('mousedown', vResize);
            $wrapper.appendTo($bottomRow);
        }

        return $wrapper;
    }

    function createToolbar($element, options) {
        var $toolbar = $('<div class="sliderman-panel-toolbar"></div>');
        var $toolbarTitle = $('<div class="sliderman-panel-toolbar-title"></div>').appendTo($toolbar);
        var $toolbarButtons = $('<div class="sliderman-panel-toolbar-buttons"></div>').appendTo($toolbar);

        if (options.title) {
            $toolbarTitle.html(options.title);
        }

        // Add the close button
        var glyphClasses;
        if (options.position === 'left') {
            glyphClasses = 'glyphicon glyphicon-chevron-left';
        } else if (options.position === 'right') {
            glyphClasses = 'glyphicon glyphicon-chevron-right';
        } else if (options.position === 'top') {
            glyphClasses = 'glyphicon glyphicon-chevron-up';
        } else if (options.position === 'bottom') {
            glyphClasses = 'glyphicon glyphicon-chevron-down';
        }

        $('<span class="sliderman-panel-toolbar-button"></span>').addClass(glyphClasses).appendTo($toolbarButtons).click(function () {
            getApi($element).toggle();
        });

        return $toolbar;
    }

    function animateIn($element, position, callback) {
        var slideDirection;

        if (position === 'top') {
            $topRow.show();
            slideDirection = 'up';
        } else if (position === 'bottom') {
            $bottomRow.show();
            slideDirection = 'down';
        } else if (position === 'left' || position === 'right') {
            slideDirection = position;
        }

        $element.toggle('slide', {
            direction: slideDirection
        }, 100, function () {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    }

    function animateOut($element, position, callback) {
        var slideDirection;

        if (position === 'top') {
            slideDirection = 'up';
        } else if (position === 'bottom') {
            slideDirection = 'down';
        } else if (position === 'left' || position === 'right') {
            slideDirection = position;
        }

        $element.toggle('slide', {
            direction: slideDirection
        }, 100, function () {
            if (position === 'top') {
                $topRow.hide();
            } else if (position === 'bottom') {
                $bottomRow.hide();
            }

            if ($.isFunction(callback)) {
                callback();
            }
        });
    }

    /**
     * Generate API for the slider element
     * @param $element
     * @returns {{}}
     */
    function api($element, options) {
        var active = false;
        var eventHandlers = {
            slideIn: [], slideOut: []
        };

        var doSlideIn = function (callback) {
            active = true;
            activeElements[options.position] = doSlideOut;
            animateIn($element, options.position, callback);
        };

        var doSlideOut = function (callback) {
            active = false;
            activeElements[options.position] = null;
            animateOut($element, options.position, callback);
        };

        return {
            on: function (events, handler) {
                $.each(events.split(' '), function (event) {
                    if (eventHandlers[event] !== undefined) {
                        eventHandlers[event].push(handler);
                    }
                });
            },

            off: function (events, handler) {
                $.each(events.split(' '), function (event) {
                    if (eventHandlers[event] !== undefined) {
                        eventHandlers[event] = $.grep(eventHandlers[event], function (el) {
                            return el !== handler;
                        });
                    }
                });
            },

            toggle: function () {
                if (active) {
                    this.slideOut();
                } else {
                    this.slideIn();
                }
            },

            slideIn: function (callback) {
                // Check if something else is active
                // If it is, then call slideOut on that first
                var doSlideOutFn = activeElements[options.position];
                if (doSlideOutFn !== null) {
                    doSlideOutFn(function () {
                        doSlideIn(callback);
                    });
                } else {
                    doSlideIn(callback);
                }
            },

            slideOut: function (callback) {
                doSlideOut(callback);
            }
        };
    }

    $.fn.sliderman = function (options) {
        // Initialise if not already
        if (!initialised) {
            init();
        }

        return this.data('sliderman', api(createWrapper(this, options), options));
    };

}(jQuery));