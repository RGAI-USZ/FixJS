function () {
    debug = options.checkEnabled('noads_debug_enabled_state');
    lng = new TRANSLATION();

    if (options.checkEnabled('noads_tb_enabled_state')) {
        button = opera.contexts.toolbar.createItem({
            disabled: true,
            title: 'NoAds Advanced',
            icon: 'icons/icon18.png',
            popup: {
                href: 'menu.html',
                width: lng.baseMenuWidth || 180,
                height: lng.baseMenuHeight || 155
            },
            badge : {
                display: 'none',
                textContent: '0',
                color: 'white',
                backgroundColor: 'rgba(211, 0, 4, 1)'
            }
        });
        opera.contexts.toolbar.addItem(button);
    } else {
        button = { disabled: true };
    }

    function isAccessible() {
        var atab = opera.extension.tabs.getFocused();
        return !!atab && (typeof atab.port !== 'undefined' ? !!atab.port : true);
    }
    
    function enableButton (e) {
        // http://my.opera.com/community/forums/topic.dml?id=1419032
        button.disabled = !isAccessible();
    }

    function onConnectHandler (e) {
        var atab = opera.extension.tabs.getFocused();
        if (!atab || !e) return;
        // if we got a message fom the menu
        if (e.origin && ~e.origin.indexOf('menu.html') && ~e.origin.indexOf('widget://')) {
            atab.postMessage(encodeMessage({ type: 'noads_bg_port' }), [e.source]);
        } else {
            // if we got a message fom a page
            if (notification_text !== '') {
                atab.postMessage(encodeMessage({ type: 'noadsadvanced_autoupdate', text: notification_text}));
                notification_text = '';
            }
            if (typeof e.tab !== 'undefined' && e.tab == opera.extension.tabs.getFocused()) {
                // make sure the button disabled in 12 after reload until it's ready
                button.disabled = true;
            }
        }
    }

    function onMessageHandler (e) {
        var message = decodeMessage(e.data);
        switch (message.type) {
            //case 'set_badge':
            //    button.badge.display = "block";
            //    button.badge.textContent = message.blocked || '0';
            //    button.badge.color = "white";
            //    break;
            case 'enable_button':
                button.disabled = false;
                break;
            case 'get_filters':
                if (!e.source) return;

                if (!message.url || !message.url.length) {
                    log('URL/CSS filter import error -> invalid URL.');
                    e.source.postMessage(encodeMessage({
                        type: 'noads_import_status',
                        status: 'download failed',
                        url: 'unknown'
                    }));
                    return;
                }

                var message_rules = 0, message_success = [], message_error = [], message_fileerror = [],
                importerCallback = function (rulesN) {
                    if (rulesN) {
                        message_success.push(message.url[subsc]);
                        message_rules = rulesN;
                    } else {
                        message_fileerror.push(message.url[subsc]);
                    }
                };
                for (var subsc = 0, l = message.url.length; subsc < l; subsc++) {
                    try {
                        importer.request(message.url[subsc], subsc, message.allRules, importerCallback);
                    } catch (ex) {
                        log('URL/CSS filter import error -> ' + ex);
                        message_error.push(message.url[subsc]);
                    }
                }
                if (message_success.length) {
                    e.source.postMessage(encodeMessage({
                        type: 'noads_import_status',
                        status: 'good',
                        url: '\n' + message_success.join('\n') + '\n',
                        length: message_rules
                    }));
                }
                if (message_fileerror.length) {
                    e.source.postMessage(encodeMessage({
                        type: 'noads_import_status',
                        status: 'file error',
                        url: '\n' + message_fileerror.join('\n') + '\n'
                    }));
                }
                if (message_error.length) {
                    e.source.postMessage(encodeMessage({
                        type: 'noads_import_status',
                        status: 'download failed',
                        url: '\n' + message_error.join('\n') + '\n'
                    }));
                }
                break;
            case 'unblock_address':
                log('user URL-filter removing url -> ' + message.url);
                opera.extension.urlfilter.block.remove(message.url);
                var filters_length = importer.array_user_filters.length;
                for (var i = 0; i < filters_length; i++) {
                    if (importer.array_user_filters[i] == message.url) {
                        importer.array_user_filters.splice(i, 1);
                        break;
                    }
                }
                if (filters_length) {
                    setValue('noads_userurlfilterlist', importer.array_user_filters.join('\n'));
                } else {
                    setValue('noads_urlfilterlist', '');
                }
                break;
            case 'block_address':
                log('user URL-filter adding url -> ' + message.url);
                opera.extension.urlfilter.block.add(message.url);
                importer.array_user_filters.unshift(message.url);
                setValue('noads_userurlfilterlist', importer.array_user_filters.join('\n'));
                break;
            case 'reload_rules':
                importer.reloadRules(message.global, message.clear);
                break;
            case 'noads_import_status':
                if (message.status === 'good') {
                    window.alert(lng.iSubs.replace('%url', message.url).replace('%d', message.length));
                } else {
                    window.alert(lng.mSubscriptions + ' ' + lng.pError + ': ' + message.status + '\n\nURL: ' + message.url);
                }
                break;
        }
    }

    if (options.checkEnabled('noads_autoupdate_state')) {
        var next_update = Number(getValue('noads_last_update')) + Number(getValue('noads_autoupdate_interval'));
        if (next_update < Date.now()) {
            var url = options.getSubscriptions(), allRules = options.checkEnabled('noads_allrules_state'), importerCallback = function(rulesN) {
                notification_text = lng.pAutoUpdateComplete || 'NoAds Advanced autoupdated';
            };
            for (var subsc = 0, l = url.length; subsc < l; subsc++) {
                try {
                    importer.request(url[subsc], subsc, allRules, importerCallback);
                } catch (ex) {
                    log('URL/CSS filter import error -> ' + ex);
                }
            }
        }
    }

    // adding URL filters on load
    importer.reloadRules(true, !options.checkEnabled('noads_urlfilterlist_state'));
    importer.reloadRules(false, !options.checkEnabled('noads_userurlfilterlist_state'));

    // Enable the button when a tab is ready.
    opera.extension.onconnect = onConnectHandler;
    opera.extension.tabs.onfocus = enableButton;
    opera.extension.tabs.onblur = enableButton;
    opera.extension.onmessage = onMessageHandler;
}