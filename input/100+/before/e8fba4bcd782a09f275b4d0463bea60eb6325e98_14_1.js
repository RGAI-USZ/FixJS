function(a){if(!Modernizr.genericDOM){var c=document,n,k,p=/<([\w:]+)/,o={option:1,optgroup:1,legend:1,thead:1,tr:1,td:1,col:1,area:1};a.webshims.fixHTML5=function(a){if("string"!=typeof a||o[(p.exec(a)||["",""])[1].toLowerCase()])return a;if(!k){n=c.body;if(!n)return a;k=c.createElement("div");k.style.display="none"}var s=k.cloneNode(!1);n.appendChild(s);s.innerHTML=a;n.removeChild(s);return s.childNodes}}}