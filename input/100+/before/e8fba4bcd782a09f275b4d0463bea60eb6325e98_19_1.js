function(b){return!!(a.prop(b,"willValidate")&&!1===a.prop(b,"required"))},"in-range":function(b){if(!t[a.prop(b,"type")]||!a.prop(b,"willValidate"))return!1;b=a.prop(b,"validity");return!(!b||b.rangeOverflow||b.rangeUnderflow)},"out-of-range":function(b){if(!t[a.prop(b,"type")]||!a.prop(b,"willValidate"))return!1;b=a.prop(b,"validity");return!(!b||!b.rangeOverflow&&!b.rangeUnderflow)}});["valid","invalid","required","optional"].forEach(function(b){a.expr.filters[b]=
a.expr.filters[b+"-element"]});var p=a.event.customEvent||{};(l.bustedValidity||l.findRequired)&&function(){var b=a.find,e=a.find.matchesSelector,c=/(\:valid|\:invalid|\:optional|\:required|\:in-range|\:out-of-range)(?=[\s\[\~\.\+\>\:\#*]|$)/ig,d=function(a){return a+"-element"};a.find=function(){var a=Array.prototype.slice,e=function(e){var f=arguments,f=a.call(f,1,f.length);f.unshift(e.replace(c,d));return b.apply(this,f)},f;for(f in b)b.hasOwnProperty(f)&&(e[f]=b[f]);return e}