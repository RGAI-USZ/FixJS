function pickedTags(){
    
    var interestingTags = {};
    var ignoredTags = {};
    var subscribedTags = {};
    var interestingTagDetailBox = new TagDetailBox('interesting');
    var ignoredTagDetailBox = new TagDetailBox('ignored');
    var subscribedTagDetailBox = new TagDetailBox('subscribed');

    var sendAjax = function(tagnames, reason, action, callback){
        var url = '';
        if (action == 'add') {
            if (reason == 'good') {
                url = askbot['urls']['mark_interesting_tag'];
            } else  if (reason == 'bad') {
                url = askbot['urls']['mark_ignored_tag'];
            } else {
                url = askbot['urls']['mark_subscribed_tag'];
            }
        }
        else {
            url = askbot['urls']['unmark_tag'];
        }

        var call_settings = {
            type:'POST',
            url:url,
            data: JSON.stringify({tagnames: tagnames}),
            dataType: 'json'
        };
        if (callback !== false){
            call_settings.success = callback;
        }
        $.ajax(call_settings);
    };

    var unpickTag = function(from_target, tagname, reason, send_ajax){
        //send ajax request to delete tag
        var deleteTagLocally = function(){
            from_target[tagname].remove();
            delete from_target[tagname];
        };
        if (send_ajax){
            sendAjax(
                [tagname],
                reason,
                'remove',
                function(){
                    deleteTagLocally();
                    liveSearch.refresh();
                }
            );
        }
        else {
            deleteTagLocally();
        }
    };

    var getTagList = function(reason){
        var base_selector = '.marked-tags';
        if (reason === 'good') {
            var extra_selector = '.interesting';
        } else if (reason === 'bad') {
            var extra_selector = '.ignored';
        } else if (reason === 'subscribed') {
            var extra_selector = '.subscribed';
        }
        return $(base_selector + extra_selector);
    };

    var getWildcardTagDetailBox = function(reason){
        if (reason === 'good') {
            return interestingTagDetailBox;
        } else if (reason === 'bad') {
            return ignoredTagDetailBox;
        } else if (reason === 'subscribed') {
            return subscribedTagDetailBox;
        }
    };

    var handleWildcardTagClick = function(tag_name, reason){
        var detail_box = getWildcardTagDetailBox(reason);
        var tag_box = getTagList(reason);
        if (detail_box.isBlank()){
            detail_box.renderFor(tag_name);
        } else if (detail_box.belongsTo(tag_name)){
            detail_box.clear();//toggle off
        } else {
            detail_box.clear();//redraw with new data
            detail_box.renderFor(tag_name);
        }
        if (!detail_box.inDocument()){
            tag_box.after(detail_box.getElement());
            detail_box.enterDocument();
        }
    };

    var renderNewTags = function(
                        clean_tag_names,
                        reason,
                        to_target,
                        to_tag_container
                    ){
        $.each(clean_tag_names, function(idx, tag_name){
            var tag = new Tag();
            tag.setName(tag_name);
            tag.setDeletable(true);

            if (/\*$/.test(tag_name)){
                tag.setLinkable(false);
                var detail_box = getWildcardTagDetailBox(reason);
                tag.setHandler(function(){
                    handleWildcardTagClick(tag_name, reason);
                    if (detail_box.belongsTo(tag_name)){
                        detail_box.clear();
                    }
                });
                var delete_handler = function(){
                    unpickTag(to_target, tag_name, reason, true);
                    if (detail_box.belongsTo(tag_name)){
                        detail_box.clear();
                    }
                }
            } else {
                var delete_handler = function(){
                    unpickTag(to_target, tag_name, reason, true);
                }
            }
            
            tag.setDeleteHandler(delete_handler);
            var tag_element = tag.getElement();
            to_tag_container.append(tag_element);
            to_target[tag_name] = tag_element;
        });
    };

    var handlePickedTag = function(reason){
        var to_target = interestingTags;
        var from_target = ignoredTags;
        var to_tag_container;
        if (reason === 'bad') {
            var input_sel = '#ignoredTagInput';
            to_target = ignoredTags;
            from_target = interestingTags;
            to_tag_container = $('div .tags.ignored');
        } else if (reason === 'good') {
            var input_sel = '#interestingTagInput';
            to_tag_container = $('div .tags.interesting');
        } else if (reason === 'subscribed') {
            var input_sel = '#subscribedTagInput';
            to_target = subscribedTags;
            to_tag_container = $('div .tags.subscribed');
        } else {
            return;
        }

        var tagnames = getUniqueWords($(input_sel).attr('value'));

        if (reason !== 'subscribed') {//for "subscribed" we do not remove
            $.each(tagnames, function(idx, tagname) {
                if (tagname in from_target) {
                    unpickTag(from_target, tagname, reason, false);
                }
            });
        }

        var clean_tagnames = [];
        $.each(tagnames, function(idx, tagname){
            if (!(tagname in to_target)){
                clean_tagnames.push(tagname);
            }
        });

        if (clean_tagnames.length > 0){
            //send ajax request to pick this tag

            sendAjax(
                clean_tagnames,
                reason,
                'add',
                function(){ 
                    renderNewTags(
                        clean_tagnames,
                        reason,
                        to_target,
                        to_tag_container
                    );
                    $(input_sel).val('');
                    liveSearch.refresh();
                }
            );
        }
    };

    var collectPickedTags = function(section){
        if (section === 'interesting') {
            var reason = 'good';
            var tag_store = interestingTags;
        } else if (section === 'ignored') {
            var reason = 'bad';
            var tag_store = ignoredTags;
        } else if (section === 'subscribed') {
            var reason = 'subscribed';
            var tag_store = subscribedTags;
        } else {
            return;
        }
        $('.' + section + '.tags.marked-tags .tag-left').each(
            function(i,item){
                var tag = new Tag();
                tag.decorate($(item));
                tag.setDeleteHandler(function(){
                    unpickTag(
                        tag_store,
                        tag.getName(),
                        reason,
                        true
                    )
                });
                if (tag.isWildcard()){
                    tag.setHandler(function(){
                        handleWildcardTagClick(tag.getName(), reason)
                    });
                }
                tag_store[tag.getName()] = $(item);
            }
        );
    };

    var setupTagFilterControl = function(control_type){
        $('#' + control_type + 'TagFilterControl input')
        .unbind('click')
        .click(function(){
            $.ajax({
                type: 'POST',
                dataType: 'json',
                cache: false,
                url: askbot['urls']['set_tag_filter_strategy'],
                data: {
                    filter_type: control_type,
                    filter_value: $(this).val()
                },
                success: function(){
                    liveSearch.refresh();
                }
            });
        });
    };

    var getResultCallback = function(reason){
        return function(){ 
            handlePickedTag(reason);
        };
    };

    return {
        init: function(){
            collectPickedTags('interesting');
            collectPickedTags('ignored');
            collectPickedTags('subscribed');
            setupTagFilterControl('display');
            setupTagFilterControl('email');
            var ac = new AutoCompleter({
                url: askbot['urls']['get_tag_list'],
                preloadData: true,
                minChars: 1,
                useCache: true,
                matchInside: true,
                maxCacheLength: 100,
                delay: 10
            });


            var interestingTagAc = $.extend(true, {}, ac);
            interestingTagAc.decorate($('#interestingTagInput'));
            interestingTagAc.setOption('onItemSelect', getResultCallback('good'));

            var ignoredTagAc = $.extend(true, {}, ac);
            ignoredTagAc.decorate($('#ignoredTagInput'));
            ignoredTagAc.setOption('onItemSelect', getResultCallback('bad'));

            var subscribedTagAc = $.extend(true, {}, ac);
            subscribedTagAc.decorate($('#subscribedTagInput'));
            subscribedTagAc.setOption('onItemSelect', getResultCallback('subscribed'));

            $("#interestingTagAdd").click(getResultCallback('good'));
            $("#ignoredTagAdd").click(getResultCallback('bad'));
            $("#subscribedTagAdd").click(getResultCallback('subscribed'));
        }
    };
}