/**
 * Sliderman
 * Created by Tom Davies
 * Sliderman, Sliderman. Does whatever a slider can.
 */
(function (window, $, undefined) {
    var minSize = 30;
    var initialised = false;
    
    var $outerRowContainer  = $('.sliderman-container-outer-row');
    if ($outerRowContainer.length === 0) {
        $outerRowContainer  = $('<div class="sliderman-container-outer-row"></div>');
    }
    var $outerColContainer  = $('<div class="sliderman-container-outer-col"></div>');
    var $innerRowContainer  = $('<div class="sliderman-container-inner-row"></div>');
    var $innerColContainer  = $('<div class="sliderman-container-inner-col"></div>');
    var $middleBuffer       = $('<div class="sliderman-middle-buffer"></div>');
    var $leftMenuBar        = $('<div class="sliderman-menu sliderman-menu-left"></div>');
    var $rightMenuBar       = $('<div class="sliderman-menu sliderman-menu-right"></div>');
    var $topMenuBar         = $('<div class="sliderman-menu sliderman-menu-top"></div>');
    var $bottomMenuBar      = $('<div class="sliderman-menu sliderman-menu-bottom"></div>');

    var activeElements = {
        top: null,
        right: null,
        bottom: null,
        left: null
    };

    function init() {
        // Add the slider container elements to body
        $innerColContainer
            .append($middleBuffer);
        $innerRowContainer
            .append($innerColContainer);
        $outerColContainer
            .append($topMenuBar)
            .append($innerRowContainer)
            .append($bottomMenuBar);
        $outerRowContainer
            .append($leftMenuBar)
            .append($outerColContainer)
            .append($rightMenuBar);
        $('body')
            .append($outerRowContainer);

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
        var positionClass = 'sliderman-panel-' + options.position;
        var $menuItem = null;
        var $wrapper = $('<div class="sliderman-panel"></div>').addClass(positionClass).hide();
        var $wrapperInner = $('<div class="sliderman-panel-inner"></div>').appendTo($wrapper);
        var $toolbar = createToolbar($element, options).appendTo($wrapperInner);
        var $resizer = $('<div class="sliderman-resizer"></div>');
        $element.addClass('sliderman-panel-content').appendTo($wrapperInner);

        var mouseDown = function (event) {
            event.preventDefault();
            $(document).on('mousemove', move);
            $(document).on('mousemove', throttledWindowResize);
            $(document).on('mouseup', mouseUp);
        };

        var mouseUp = function (event) {
            event.preventDefault();
            $(document).unbind('mousemove', move);
            $(document).unbind('mousemove', throttledWindowResize);
            $(document).unbind('mouseup', mouseUp);
        };

        var touchStart = function (event) {
            event.preventDefault();
            $(document).on('touchmove', move);
            $(document).on('touchmove', throttledWindowResize);
            $(document).on('touchend', touchEnd);
        };

        var touchEnd = function (event) {
            event.preventDefault();
            $(document).unbind('touchmove', move);
            $(document).unbind('touchmove', throttledWindowResize);
            $(document).unbind('touchend', touchEnd);
        };

        $resizer.on('mousedown', mouseDown);
        $resizer.on('touchstart', touchStart);

        var throttledWindowResize = (function () {
            var func = function () {
                $(window).resize();
            };
            var wait = 100;
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }());

        var move = function (event, event2) {
            if (event2) {
                event = event2;
            }

            event.preventDefault();

            var pageX = event.pageX;
            var pageY = event.pageY;

            if (event.type === "touchmove") {
                pageX = event.originalEvent.touches[0].pageX;
                pageY = event.originalEvent.touches[0].pageY;
            }

            var offsetX = $innerRowContainer.offset().left;
            var offsetY = $innerColContainer.offset().top;
            var x = Math.max(pageX - offsetX, 0);
            var y = Math.max(pageY - offsetY, 0);
            var w = $innerRowContainer.width();
            var h = $innerColContainer.height();
            var sizePixels;
            var sizePercent;

            if (options.position === 'left' || options.position === 'right') {
                if (options.position === 'right') {
                    sizePixels = Math.max(w - x - ($resizer.width() / 2), 0);
                } else {
                    sizePixels = Math.max(x + ($resizer.width() / 2), 0);
                }

                sizePercent = (sizePixels / w) * 100;
                $wrapper.css('width', Math.min(sizePercent, 50) + '%');
            } else {
                if (options.position === 'top') {
                    sizePixels = Math.max(y - ($resizer.height() / 2), 0);
                } else {
                    sizePixels = Math.max(h - y + ($resizer.height() / 2), 0);
                }

                sizePercent = (sizePixels / h) * 100;
                $wrapper.css('height', Math.min(sizePercent, 50) + '%');
            }

            if (sizePixels < minSize) {
                // Slide out
                $(document).unbind('mousemove', move);
                $(document).unbind('mouseup', mouseUp);
                $(document).unbind('touchmove', move);
                $(document).unbind('touchend', touchEnd);

                getApi($element).slideOut(function () {
                    if (options.position === 'left' || options.position === 'right') {
                        $wrapper.css('width', '25%');
                    } else {
                        $wrapper.css('height', '25%');
                    }
                });
            }
        };

        if (options.position === 'right') {
            // Add to menu if option enabled
            // if (options.showInMenu) {
            //     $menuItem = $('<div class="sliderman-menu-item">' + options.title + '</div>');
            //     $rightMenuBar.append($menuItem);
            //     $rightMenuBar.show();
            // }

            // Move element into container
            $resizer.prependTo($wrapper);
            $wrapper.appendTo($innerRowContainer);
        } else if (options.position === 'left') {
            // Add to menu if option enabled
            // if (options.showInMenu) {
            //     $menuItem = $('<div class="sliderman-menu-item">' + options.title + '</div>');
            //     $leftMenuBar.append($menuItem);
            //     $leftMenuBar.show();
            // }

            // Move element into container
            $resizer.appendTo($wrapper);
            $wrapper.prependTo($innerRowContainer);
        } else if (options.position === 'top') {
            // Add to menu if option enabled
            // if (options.showInMenu) {
            //     $menuItem = $('<div class="sliderman-menu-item">' + options.title + '</div>');
            //     $topMenuBar.append($menuItem);
            //     $topMenuBar.show();
            // }

            // Move element into container
            $resizer.appendTo($wrapper);
            $wrapper.prependTo($innerColContainer);
        } else if (options.position === 'bottom') {
            // Add to menu if option enabled
            // if (options.showInMenu) {
            //     $menuItem = $('<div class="sliderman-menu-item">' + options.title + '</div>');
            //     $bottomMenuBar.append($menuItem);
            //     $bottomMenuBar.show();
            // }

            // Move element into container
            $resizer.prependTo($wrapper);
            $wrapper.appendTo($innerColContainer);
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
            slideDirection = 'up';
        } else if (position === 'bottom') {
            slideDirection = 'down';
        } else if (position === 'left' || position === 'right') {
            slideDirection = position;
        }

        $element.toggle('slide', {
            direction: slideDirection
        }, 100, function () {
            $(window).resize();

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
            $(window).resize();

            if ($.isFunction(callback)) {
                callback();
            }
        });
    }

    /**
     * Generate API for the slider element
     * @param $element
     * @param options
     * @returns {{}}
     */
    function api($element, options) {
        var active = false;

        var eventHandlers = {
            slideIn: [], slideOut: []
        };

        var isActive = function () {
            return active;
        };

        var on = function (events, handler) {
            $.each(events.split(' '), function (index, val) {
                if (eventHandlers[val] !== undefined) {
                    eventHandlers[val].push(handler);
                }
            });
        };

        var off = function (events, handler) {
            $.each(events.split(' '), function (index, val) {
                if (eventHandlers[val] !== undefined) {
                    eventHandlers[val] = $.grep(eventHandlers[val], function (el) {
                        return el !== handler;
                    });
                }
            });
        };

        var toggle = function () {
            if (active) {
                this.slideOut();
            } else {
                this.slideIn();
            }
        };

        var slideIn = function (callback) {
            if (!active) {
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
            }
        };

        var slideOut = function (callback) {
            if (active) {
                doSlideOut(callback);
            }
        };

        var doSlideIn = function (callback) {
            active = true;
            activeElements[options.position] = doSlideOut;
            animateIn($element, options.position, function () {
                // Call event listeners
                $.each(eventHandlers.slideIn, function(index, val) {
                    if ($.isFunction(val)) {
                        val($element);
                    }
                });

                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        var doSlideOut = function (callback) {
            active = false;
            activeElements[options.position] = null;
            animateOut($element, options.position, function () {
                // Call event listeners
                $.each(eventHandlers.slideOut, function(index, val) {
                    if ($.isFunction(val)) {
                        val($element);
                    }
                });

                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        if (options.visible) {
            slideIn();
        }

        return {
            isActive: isActive,
            on: on,
            off: off,
            toggle: toggle,
            slideIn: slideIn,
            slideOut: slideOut
        };
    }

    $.fn.sliderman = function (options) {
        // Initialise if not already
        if (!initialised) {
            init();
        }

        return this.data('sliderman', api(createWrapper(this, options), options));
    };

}(window, jQuery));