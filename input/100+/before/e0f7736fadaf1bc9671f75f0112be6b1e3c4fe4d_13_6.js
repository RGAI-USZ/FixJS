function(){c(a).data("mediaerror")&&c(a).trigger("mediaerror")},1)};var y=function(){var a;return function(b,c,f){e.ready("mediaelement-swf",function(){k.createSWF?k.createSWF(b,c,f):a||(a=!0,w(),y(b,c,f))})}}(),g=function(a,b,c,f,e){c||!1!==c&&b&&"flash"==b.isActive?(c=k.canSwfPlaySrces(a,f))?y(a,c,b):e?k.setError(a,!1):g(a,b,!1,f,!0):(c=k.canNativePlaySrces(a,f))?b&&"flash"==b.isActive&&k.setActive(a,"html5",b):e?(k.setError(a,!1),b&&"flash"==b.isActive&&
k.setActive(a,"html5",b)):g(a,b,!0,f,!0)},l=/^(?:embed|object|datalist)$/i,i=function(a,b){var d=e.data(a,"mediaelementBase")||e.data(a,"mediaelementBase",{}),f=k.srces(a),i=a.parentNode;clearTimeout(d.loadTimer);c.data(a,"mediaerror",!1);if(f.length&&i&&!(1!=i.nodeType||l.test(i.nodeName||"")))b=b||e.data(a,"mediaelement"),g(a,b,u.preferFlash||p,f)};c(s).bind("ended",function(a){