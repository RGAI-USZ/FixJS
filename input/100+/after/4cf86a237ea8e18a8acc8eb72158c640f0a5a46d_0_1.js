function ($window) {
    'use strict';
    return {
        link: function (scope, elm, attrs) {
            var top = elm.offset().top;
            if (!attrs.uiScrollfix) {
                attrs.uiScrollfix = top;
            } else {
                // chartAt is generally faster than indexOf: http://jsperf.com/indexof-vs-chartat
                if (attrs.uiScrollfix.charAt(0) === '-') {
                    attrs.uiScrollfix = top - attrs.uiScrollfix.substr(1);
                } else if (attrs.uiScrollfix.charAt(0) === '+') {
                    attrs.uiScrollfix = top + attrs.uiScrollfix.substr(1);
                }
            }
            $($window).bind('scroll.ui-scrollfix', function () {
                // if pageYOffset is defined use it, otherwise use other crap for IE
                var offset;
                if (angular.isDefined($window.pageYOffset)) {
                    offset = $window.pageYOffset;
                } else {
                    var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
                    offset = iebody.scrollTop;
                }
                if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
                    elm.addClass('ui-scrollfix');
                } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
                    elm.removeClass('ui-scrollfix');
                }
            });
        }
    };
}