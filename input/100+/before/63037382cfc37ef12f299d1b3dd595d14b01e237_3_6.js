function i(c){wa=c}function k(){if(C!=window._$_APP_CLASS_$_)T();else if(!O){ca=null;if(R){if(!xa){if(confirm("The application was quited, do you want to restart?"))document.location=document.location;xa=true}}else{var c,d,f;if(E.length>0){c=g();d=c.feedback?setTimeout(U,_$_INDICATOR_TIMEOUT_$_):null;f=false}else{c={result:"&signal=poll"};d=null;f=true}c.result+="&ackId="+ra+"&pageId="+wa;if(qa){var h="",n=$("#"+qa).get(0);if(n)for(n=n.parentNode;!p.hasTag(n,"BODY");n=n.parentNode)if(n.id){if(h!=
"")h+=",";h+=n.id}c.result+="&ackPuzzle="+encodeURIComponent(h)}c.result+="&_$_PARAMS_$_";if(y.socket!=null&&y.socket.readyState==1){O=null;d!=null&&clearTimeout(d);f||y.socket.send(c.result)}else{O=na.sendUpdate("request=jsupdate"+c.result,d,ra,-1);W=f?setTimeout(S,_$_SERVER_PUSH_TIMEOUT_$_):null}}}}function l(c,d,f){if(typeof c.wtWidth==="undefined"||c.wtWidth!=d||typeof c.wtHeight==="undefined"||c.wtHeight!=f){c.wtWidth=d;c.wtHeight=f;o(c,"resized",d,f)}}