function(a){if(!Modernizr.genericDOM){var c=document,o,l,r=/<([\w:]+)/,k={option:1,optgroup:1,legend:1,thead:1,tr:1,td:1,col:1,area:1};a.webshims.fixHTML5=function(a){if("string"!=typeof a||k[(r.exec(a)||["",""])[1].toLowerCase()])return a;if(!l){o=c.body;if(!o)return a;l=c.createElement("div");l.style.display="none"}var u=l.cloneNode(!1);o.appendChild(u);u.innerHTML=a;o.removeChild(u);return u.childNodes}}}