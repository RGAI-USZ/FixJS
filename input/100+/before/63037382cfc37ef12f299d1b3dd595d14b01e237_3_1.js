function(a,b){if(b)Z=new Date;b=new Date;b=(b.getMinutes()-Z.getMinutes())*6E4+(b.getSeconds()-Z.getSeconds())*1E3+(b.getMilliseconds()-Z.getMilliseconds());window.console&&console.log("["+b+"]: "+a)}"undefined"){o=new XDomainRequest;if(l){s=false;try{o.open(k,l+"&contentType=x-www-form-urlencoded")}catch(t){o=null}}}else o=null;else l&&o.open(k,l,true)}else if(!i&&window.ActiveXObject){try{o=new ActiveXObject("Msxml2.XMLHTTP")}catch(q){try{o=new ActiveXObject("Microsoft.XMLHTTP")}catch(A){}}l&&o&&o.open(k,l,true)}o&&l&&s&&o.setRequestHeader("Content-type","application/x-www-form-urlencoded");return o}var i=a.indexOf("://")!=-1&&M(a)!=window.location.host;return e("POST",a)!=null?new (function(){function k(o,