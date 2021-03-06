function () {
    // fix for a higher font height settings, default font defined in CSS as 12px
    var default_size = 12,
        actual_font;
    try {
        actual_font = opera.extension.bgProcess.actual_font || parseInt(window.getComputedStyle(document.getElementById("id-menu"), null).getPropertyValue("font-size").replace(/[a-z]/gi, ''), 10);
        if (!opera.extension.bgProcess.menu_resized && actual_font / default_size > 1) {
            var height = opera.extension.bgProcess.button.popup.height,
            width = opera.extension.bgProcess.button.popup.width;
            opera.extension.bgProcess.button.popup.height = Math.round(height * actual_font / default_size);
            opera.extension.bgProcess.button.popup.width = Math.round(width * actual_font / default_size);
            opera.extension.bgProcess.menu_resized = true;
            opera.extension.bgProcess.actual_font = actual_font;
        }
    } catch (bug) {}

    var block_ads = document.getElementById('block_ads'),
        block_ele = document.getElementById('block_ele'),
        unblock_ele = document.getElementById('unblock_ele'),
        unblock_latest = document.getElementById('unblock_latest'),
        show_preferences = document.getElementById('show_preferences'),
        content_block_helper = document.getElementById('content_block_helper');

    block_ads.onclick = function () { sendCommand({type: 'block_ads'}); };
    block_ele.onclick = function () { sendCommand({type: 'block_ele'}); };
    unblock_ele.onclick = function () { sendCommand({type: 'unblock_ele'}); };
    unblock_latest.onclick = function () { sendCommand({type: 'unblock_latest'}); };
    show_preferences.onclick = function () { sendCommand({type: 'show_preferences'}); };
    content_block_helper.onclick = function () { sendCommand({type: 'content_block_helper'}); };

    if (theport) {
        try {
            theport.postMessage(encodeMessage({type: 'ask_status'}));
        } catch(e) {}
    }

    document.body.style.color = enabled ? 'black' : 'gray';
}