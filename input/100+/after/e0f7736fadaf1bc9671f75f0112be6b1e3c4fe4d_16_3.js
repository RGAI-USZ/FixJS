function(b){b?a.attr(this,"novalidate","novalidate"):a(this).removeAttr("novalidate")},get:function(){return null!=a.attr(this,"novalidate")}}});a.browser.webkit&&Modernizr.inputtypes.date&&function(){var b={updateInput:1,input:1},d={date:1,time:1,"datetime-local":1},f={focusout:1,blur:1},j={updateInput:1,change:1},l=function(a){var d,k=!0,s=a.prop("value"),h=s,g=function(d){if(a){var f=a.prop("value");f!==s&&(s=f,(!d||!b[d.type])&&a.trigger("input"));d&&j[d.type]&&(h=f);!k&&f!==h&&a.trigger("change")}}