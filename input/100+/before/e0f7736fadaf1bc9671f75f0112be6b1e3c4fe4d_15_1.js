function(a){if(!Modernizr.genericDOM){var d=document,l,j,m=/<([\w:]+)/,t={option:1,optgroup:1,legend:1,thead:1,tr:1,td:1,col:1,area:1};a.webshims.fixHTML5=function(a){if("string"!=typeof a||t[(m.exec(a)||["",""])[1].toLowerCase()])return a;if(!j){l=d.body;if(!l)return a;j=d.createElement("div");j.style.display="none"}var o=j.cloneNode(!1);l.appendChild(o);o.innerHTML=a;l.removeChild(o);return o.childNodes}}}