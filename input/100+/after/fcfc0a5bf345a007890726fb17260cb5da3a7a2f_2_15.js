function(b,d){if(o.hasOwnProperty(d)){var e;c.isArray(b)?(e=l[d]=b[1],o[d]=b[0]):e=l[d]=l[d]||a.easing;c.isString(e)&&(e=l[d]=j[e]);l[d]=e||j.easeNone}});c.each(r,function(a,b){var e,f,g;if(g=o[b]){f={};c.each(a,function(a){f[a]=d.css(h,a);l[a]=l[b]});d.css(h,b,g);for(e in f)o[e]=d.css(h,e),d.css(h,e,f[e]);delete o[b]}}