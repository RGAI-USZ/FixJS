function(a,c){if(a==c)return b=!0,0;if(a.sourceIndex&&c.sourceIndex)return a.sourceIndex-c.sourceIndex}})();(function(){var a=c.createElement("div");a.appendChild(c.createComment(""));0<a.getElementsByTagName(n).length&&(q=function(a,c){var b=D(c.getElementsByTagName(a));if(a===n){for(var d=[],e=0,f;f=b[e++];)1===f.nodeType&&d.push(f);b=d}return b})})();var x=c.getElementsByClassName?function(a,c,b){if(!b)return[];var a=b.getElementsByClassName(a),
d=0,e=a.length,f;if(c&&c!==n)for(b=[];d<e;++d)f=a[d],A(f)==c&&b.push(f);else b=D(a);return b}:c.querySelectorAll?function(a,c,b){return b&&D(b.querySelectorAll((c?c:"")+"."+a))||[]}:function(a,c,b){if(!b)return[];for(var c=b.getElementsByTagName(c||n),b=[],d=0,e=c.length,f;d<e;++d)f=c[d],j(f,a)&&b.push(f);return b};e.mix(a,{query:m,get:function(a,c){return m(a,c)[0]||null}