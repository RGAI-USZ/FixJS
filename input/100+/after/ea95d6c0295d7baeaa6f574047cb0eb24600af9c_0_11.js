function S(){Xb=w.scrollTop()}function Q(){w.scrollTop(Xb)}function q(h){h.click(fa).mousedown(W)}function u(h){h.click(fa).mousedown(H)}function fa(h){if(!i("selectable")){var O=Math.min(Ba-1,Math.floor((h.pageX-v.offset().left-Ma)/db)),x=ua(O),A=this.parentNode.className.match(/fc-slot(\d+)/);if(A){A=parseInt(A[1])*i("slotMinutes");var ta=Math.floor(A/60);x.setHours(ta);x.setMinutes(A%60+La);C("dayClick",M[O],x,false,
h)}else C("dayClick",M[O],x,true,h)}}function oa(h,O,x){x&&Na.build();var A=N(K.visStart);if(Ub){x=Ca(O,A)*Ha+Ia+1;h=Ca(h,A)*Ha+Ia+1}else{x=Ca(h,A);h=Ca(O,A)}x=Math.max(0,x);h=Math.min(Ba,h);x<h&&q(ga(0,x,0,h-1))}function ga(h,O,x,A){h=Na.rect(h,O,x,A,ja);return E(h,ja)}