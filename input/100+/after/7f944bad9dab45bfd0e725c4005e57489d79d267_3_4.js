function(a){return a.toUpperCase()}),d="form"+b.name,g=b.name,i="click.webshimssubmittermutate"+g,v=function(){if("form"in this&&y[this.type]){var m=a.prop(this,"form");if(m){var r=a.attr(this,d);if(null!=r&&(!b.limitedTo||r.toLowerCase()===a.prop(this,c))){var u=a.attr(m,g);a.attr(m,g,r);setTimeout(function(){if(null!=u)a.attr(m,g,u);else try{a(m).removeAttr(g)}catch(b){m.removeAttribute(g)}},9)}}}}