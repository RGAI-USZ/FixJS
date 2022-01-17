function(a,c,q){var m=c.audio&&c.video,p=!1;if(m)a=document.createElement("video"),c.videoBuffered="buffered"in a,p="loop"in a,q.capturingEvents("play,playing,waiting,paused,ended,durationchange,loadedmetadata,canplay,volumechange".split(",")),c.videoBuffered||(q.addPolyfill("mediaelement-native-fix",{f:"mediaelement",test:c.videoBuffered,d:["dom-support"]}),q.reTest("mediaelement-native-fix"));jQuery.webshims.register("mediaelement-core",function(a,c,j,v,r){var f=c.mediaelement,s=c.cfg.mediaelement,
n=function(b,c){var b=a(b),k={src:b.attr("src")||"",elem:b,srcProp:b.prop("src")};if(!k.src)return k;var i=b.attr("type");if(i)k.type=i,k.container=a.trim(i.split(";")[0]);else if(c||(c=b[0].nodeName.toLowerCase(),"source"==c&&(c=(b.closest("video, audio")[0]||{nodeName:"video"}).nodeName.toLowerCase())),i=f.getTypeForSrc(k.src,c))k.type=i,k.container=i;if(i=b.attr("media"))k.media=i;return k},w=swfobject.hasFlashPlayerVersion("9.0.115"),o=function(){c.ready("mediaelement-swf",function(){if(!f.createSWF)c.modules["mediaelement-swf"].test=
a.noop,c.reTest(["mediaelement-swf"],m)})};f.mimeTypes={audio:{"audio/ogg":["ogg","oga","ogm"],"audio/mpeg":["mp2","mp3","mpga","mpega"],"audio/mp4":"mp4,mpg4,m4r,m4a,m4p,m4b,aac".split(","),"audio/wav":["wav"],"audio/3gpp":["3gp","3gpp"],"audio/webm":["webm"],"audio/fla":["flv","f4a","fla"],"application/x-mpegURL":["m3u8","m3u"]},video:{"video/ogg":["ogg","ogv","ogm"],"video/mpeg":["mpg","mpeg","mpe"],"video/mp4":["mp4","mpg4","m4v"],"video/quicktime":["mov","qt"],"video/x-msvideo":["avi"],"video/x-ms-asf":["asf",
"asx"],"video/flv":["flv","f4v"],"video/3gpp":["3gp","3gpp"],"video/webm":["webm"],"application/x-mpegURL":["m3u8","m3u"],"video/MP2T":["ts"]}};f.mimeTypes.source=a.extend({},f.mimeTypes.audio,f.mimeTypes.video);f.getTypeForSrc=function(b,c){if(-1!=b.indexOf("youtube.com/watch?")||-1!=b.indexOf("youtube.com/v/"))return"video/youtube";var b=b.split("?")[0].split("."),b=b[b.length-1],k;a.each(f.mimeTypes[c],function(a,c){if(-1!==c.indexOf(b))return k=a,!1});return k};f.srces=function(b,c){b=a(b);if(c)b.removeAttr("src").removeAttr("type").find("source").remove(),
a.isArray(c)||(c=[c]),c.forEach(function(a){var c=v.createElement("source");"string"==typeof a&&(a={src:a});c.setAttribute("src",a.src);a.type&&c.setAttribute("type",a.type);a.media&&c.setAttribute("media",a.media);b.append(c)});else{var c=[],k=b[0].nodeName.toLowerCase(),i=n(b,k);i.src?c.push(i):a("source",b).each(function(){i=n(this,k);i.src&&c.push(i)});return c}};a.fn.loadMediaSrc=function(b,c){return this.each(function(){c!==r&&(a(this).removeAttr("poster"),c&&a.attr(this,"poster",c));f.srces(this,
b);a(this).mediaLoad()})};f.swfMimeTypes="video/3gpp,video/x-msvideo,video/quicktime,video/x-m4v,video/mp4,video/m4p,video/x-flv,video/flv,audio/mpeg,audio/aac,audio/mp4,audio/x-m4a,audio/m4a,audio/mp3,audio/x-fla,audio/fla,youtube/flv,jwplayer/jwplayer,video/youtube".split(",");f.canSwfPlaySrces=function(b,c){var k="";w&&(b=a(b),c=c||f.srces(b),a.each(c,function(a,b){if(b.container&&b.src&&-1!=f.swfMimeTypes.indexOf(b.container))return k=b,!1}));return k};var b={};f.canNativePlaySrces=function(c,
d){var k="";if(m){var c=a(c),i=(c[0].nodeName||"").toLowerCase();if(!b[i])return k;d=d||f.srces(c);a.each(d,function(a,d){if(d.type&&b[i].prop._supvalue.call(c[0],d.type))return k=d,!1})}return k};f.setError=function(b,d){d||(d="can't play sources");a(b).pause().data("mediaerror",d);c.warn("mediaelementError: "+d);setTimeout(function(){a(b).data("mediaerror")&&a(b).trigger("mediaerror")},1)};var l=function(){var a;return function(b,k,i){c.ready("mediaelement-swf",function(){f.createSWF?f.createSWF(b,
k,i):a||(a=!0,o(),l(b,k,i))})}}(),d=function(a,b,c,i,t){c||!1!==c&&b&&"flash"==b.isActive?(c=f.canSwfPlaySrces(a,i))?l(a,c,b):t?f.setError(a,!1):d(a,b,!1,i,!0):(c=f.canNativePlaySrces(a,i))?b&&"flash"==b.isActive&&f.setActive(a,"html5",b):t?(f.setError(a,!1),b&&"flash"==b.isActive&&f.setActive(a,"html5",b)):d(a,b,!0,i,!0)},y=/^(?:embed|object|datalist)$/i,x=function(b,l){var k=c.data(b,"mediaelementBase")||c.data(b,"mediaelementBase",{}),i=f.srces(b),t=b.parentNode;clearTimeout(k.loadTimer);a.data(b,
"mediaerror",!1);if(i.length&&t&&!(1!=t.nodeType||y.test(t.nodeName||"")))l=l||c.data(b,"mediaelement"),d(b,l,s.preferFlash||r,i)};a(v).bind("ended",function(b){var d=c.data(b.target,"mediaelement");(!p||d&&"html5"!=d.isActive||a.prop(b.target,"loop"))&&setTimeout(function(){!a.prop(b.target,"paused")&&a.prop(b.target,"loop")&&a(b.target).prop("currentTime",0).play()},1)});p||c.defineNodeNamesBooleanProperty(["audio","video"],"loop");["audio","video"].forEach(function(d){var l=c.defineNodeNameProperty(d,
"load",{prop:{value:function(){var b=c.data(this,"mediaelement");x(this,b);m&&(!b||"html5"==b.isActive)&&l.prop._supvalue&&l.prop._supvalue.apply(this,arguments)}}});b[d]=c.defineNodeNameProperty(d,"canPlayType",{prop:{value:function(c){var i="";m&&b[d].prop._supvalue&&(i=b[d].prop._supvalue.call(this,c),"no"==i&&(i=""));!i&&w&&(c=a.trim((c||"").split(";")[0]),-1!=f.swfMimeTypes.indexOf(c)&&(i="maybe"));return i}}})});c.onNodeNamesPropertyModify(["audio","video"],["src","poster"],{set:function(){var b=
this,a=c.data(b,"mediaelementBase")||c.data(b,"mediaelementBase",{});clearTimeout(a.loadTimer);a.loadTimer=setTimeout(function(){x(b);b=null},9)}});j=function(){c.addReady(function(b,d){a("video, audio",b).add(d.filter("video, audio")).each(function(){a.browser.msie&&8<c.browserVersion&&a.prop(this,"paused")&&!a.prop(this,"readyState")&&a(this).is('audio[preload="none"][controls]:not([autoplay])')?a(this).prop("preload","metadata").mediaLoad():x(this);if(m){var b,i,d=this,l=function(){var b=a.prop(d,
"buffered");if(b){for(var c="",i=0,l=b.length;i<l;i++)c+=b.end(i);return c}},f=function(){var b=l();b!=i&&(i=b,a(d).triggerHandler("progress"))};a(this).bind("play loadstart progress",function(a){"progress"==a.type&&(i=l());clearTimeout(b);b=setTimeout(f,999)}).bind("emptied stalled mediaerror abort suspend",function(a){"emptied"==a.type&&(i=!1);clearTimeout(b)})}})})};m?(c.isReady("mediaelement-core",!0),j(),w&&c.ready("WINDOWLOAD mediaelement",o)):c.ready("mediaelement-swf",j)})}