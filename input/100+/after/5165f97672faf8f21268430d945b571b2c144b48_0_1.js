function($) {

    $.fn.pager = function(options){

        var opts = $.extend({}, $.fn.pager.defaults, options);

        return this.each(function(){

            // empty out the destination element and then render out the pager with the supplied options
            var htmlparts = {};
            if (typeof options.htmlparts === "undefined") {
                htmlparts = $.fn.pager.defaults.htmlparts;
            }
            $(this).empty().append(renderpager(parseInt(options.pagenumber, 10), parseInt(options.pagecount, 10), options.buttonClickCallback, htmlparts));

        });
    };

    // render and return the pager with the supplied options
    function renderpager(pagenumber, pagecount, buttonClickCallback, htmlparts) {

        // setup $pager to hold render
        var $pager = $('<ul class="sakai_pager"></ul>');

    // Without 'First' button
    $pager.append(renderButton('prev', pagenumber, pagecount, buttonClickCallback, htmlparts));

        // pager currently only handles 10 viewable pages ( could be easily parameterized, maybe in next version ) so handle edge cases
        var startPoint = 1;
        var endPoint = 5;

        if (pagenumber > 3) {
            startPoint = pagenumber - 2;
            endPoint = pagenumber + 2;
        }

        if (endPoint > pagecount) {
            startPoint = pagecount - 3;
            endPoint = pagecount;
        }

        if (startPoint < 1) {
            startPoint = 1;
        }

        // Add 3 dots divider
        var $divider_begin = $('<li id="jq_pager_three_dots_begin" class="dots hidden">...</li>');
        $pager.append($divider_begin);

        // loop thru visible pages and render buttons
        for (var page = startPoint; page <= endPoint; page++) {

            var currentButton = $($.fn.pager.defaults.htmlparts.current.replace(/[$][{][p][a][g][e][}]/ig, "" + page));

            page == pagenumber ? currentButton.addClass('pgCurrent') : currentButton.click(function() { buttonClickCallback(this.firstChild.firstChild.data); });
            currentButton.appendTo($pager);
        }

        // Add 3 dots divider
        var $divider_end = $('<li id="jq_pager_three_dots_end" class="dots hidden">...</li>');
        $pager.append($divider_end);

        // without 'Last' button:
        $pager.append(renderButton('next', pagenumber, pagecount, buttonClickCallback, htmlparts));

        if (startPoint > 1)
            {
                $divider_begin.removeClass('hidden');
            }

        if (pagecount > endPoint)
            {
                $divider_end.removeClass('hidden');
            }

        return $pager;
    }

    // renders and returns a 'specialized' button, ie 'next', 'previous' etc. rather than a page number button
    function renderButton(part, pagenumber, pagecount, buttonClickCallback, htmlparts) {

        var buttonLabel = htmlparts[part];

        var $Button = $('<li class="pgNext">' + buttonLabel + '</li>');

        var destPage = 1;

        // work out destination page for required button type
        switch (part) {
            case "first":
                destPage = 1;
                break;
            case "prev":
                destPage = pagenumber - 1;
                $Button = $('<li class="pgPrev">' + buttonLabel + '</li>');
                break;
            case "next":
                destPage = pagenumber + 1;
                break;
            case "last":
                destPage = pagecount;
                break;
        }

        // disable and 'grey' out buttons if not needed.
        if (part === "first" || part === "prev") {
            pagenumber <= 1 ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }
        else {
            pagenumber >= pagecount ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }

        return $Button;
    }

    // pager defaults. hardly worth bothering with in this case but used as placeholder for expansion in the next version
    $.fn.pager.defaults = {
        pagenumber: 1,
        pagecount: 1,
        htmlparts : {
            "first" : "first",
            "last" : "last",
            "prev" : '<span><div class=\"sakai_pager_prev\"></div> <button class=\"t\" title="Previous page">Prev</button></span>',
            "next" : '<span><button class=\"t\" title="Next page">Next</button><div class=\"sakai_pager_next\"></div></span>',
            "current": '<li class="page-number"><button title="Page ${page}">${page}</button></li>'
        }
    };

}