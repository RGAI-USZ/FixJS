function(b,e){if(o.hasOwnProperty(e)){var d;c.isArray(b)?(d=l[e]=b[1],o[e]=b[0]):d=l[e]=l[e]||a.easing;c.isString(d)&&(d=l[e]=j[d]);l[e]=d||j.easeNone}});c.each(r,function(a,b){var e,f,g;if(g=o[b]){f={};c.each(a,function(a){f[a]=d.css(h,a);l[a]=l[b]});d.css(h,b,g);for(e in f)o[e]=d.css(h,e),d.css(h,e,f[e]);delete o[b]}}