function(){return a};g[k]=c;return H(g,i)}b=a.split(".");return function(e){var n=e.context||e,o=e[b[0]];e=0;if(o&&typeof o.item!=="undefined"){e+=1;if(b[e]==="pos")return o.pos;else n=o.item}o=b.length;for(var s;e<o;e++){if(!n)break;s=n[b[e]];n=typeof s==="function"?n[b[e]].call(n):s}return!n&&n!==0?"":n}}function D(a,b,f){var c,g,i,k,l,e=[];if(typeof b==="string"){