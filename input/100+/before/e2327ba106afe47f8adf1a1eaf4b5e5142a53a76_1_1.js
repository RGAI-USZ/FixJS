function(){function g(a,c,b,d){arguments&&1<arguments.length&&this.init(a,c,b,d);return this}g.prototype={_lang:null,_holidays:[],_default:{tmpl:{hat:"{{ month.full }} {{ year.full }}",prev:"{{ month.full }} {{ year.full }}",next:"{{ month.full }} {{ year.full }}",stdout:"{{ day.num }} {{ month.part }}",mirror:"{{ year.full }}-{{ month.nums }}-{{ day.nums }}"},lang:{hide:"Hide",weekdays:{full:"Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(" "),part:"Mo Tu We Th Fr Sa Su".split(" ")}, monthes:{full:"January February March April May June July August September October November December".split(" "),decl:"January February March April May June July August September October November December".split(" "),part:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")}}},init:function(a,c,b,d){var b=b||{},d=d||{},f="",e=this._default.tmpl,j=new Date;this.shown=!1;g.lang(b.lang);c&&(this._way=c.innerHTML?"innerHTML":"value");b.tmpl||(b.tmpl={});for(f in e)b.tmpl[f]||(b.tmpl[f]=e[f]); b.min_date?"string"==typeof b.min_date&&(b.min_date=g.parse(b.min_date)):b.min_date=new Date(j.getFullYear(),j.getMonth(),j.getDate()-1);this._min=b.min_date;b.now_date?"string"==typeof b.now_date&&(b.now_date=g.parse(b.now_date)):b.now_date=j;this._now=b.now_date;b.max_date?"string"==typeof b.max_date&&(b.max_date=g.parse(b.max_date)):b.max_date=new Date(j.getFullYear()+1,j.getMonth(),j.getDate());this._max=b.max_date;this._data={prev:null,curr:null,next:null};this._nodes={days:null,prev:null,next:null, week:null,items:{alias:"",list:[],chosen:null,clicked:null},block:null,field:c,target:a};this._nodes.field&&b.default_stdout&&("string"==typeof b.default_stdout&&(b.default_stdout=g.parse(b.default_stdout)),this._nodes.field[this._way]=this._tmpl(b.tmpl.stdout,g.human(b.default_stdout)),b.mirror&&(b.mirror[this._way]=this._tmpl(b.tmpl.mirror,g.human(b.default_stdout))));this._tangled=null;this._events=[];b.offset_ignore||(this._offset=this._offsetize(this._nodes.field,this._nodes.target));this._params= {};for(f in b)"lang"!=f&&(this._params[f]=b[f]);this._handlers=d;this._install();return this},uninstall:function(){for(var a=0,c=this._events.length,b="_min _now _max shown _data _nodes _events _offset _params _tangled _handlers hiddenable".split(" "),d=null,f=this._nodes.block,e=this._nodes.target,a=0;a<c;a++)d=this._events[a],this._unbind(d.target,d.alias,d.handler);for(a=0;7>a;a++)delete this[b[a]];e.removeChild(f);return!0},tangle:function(a,c){this._tangled={instance:a,relation:c};return this}, show:function(a){var a=a||{},c="",b=null,d=this._nodes.block,b=this._nodes.field,f=this._params.offset_ignore;for(c in this._offset)a[c]||(a[c]=this._offset[c]);b=b&&""!=b[this._way]?g.parse(b[this._way]):this._params.now_date;this.shown=!0;this._draw(b);"top"!=f&&(d.style.top=a.top+a.height+"px");this._tangled&&this._tangled.instance.hide();"left"!=f&&(d.style.left=a.left+"px");this._nodes.block.className+=" b-cal_is_visible";return this},hide:function(){this._nodes.block.className=this._nodes.block.className.replace(" b-cal_is_visible", "");this.shown=!1;return this},prev:function(){this._draw(this._data.prev.raw);return this},next:function(){this._draw(this._data.next.raw);return this},jump:function(a){var a=a||!1,c=this._nodes.field[this._way],b=this._min,d=this._max,f=null,f="object"==typeof a?a:g.parse(a?a:c);f<b&&(f=b);f>d&&(f=d);this._draw(f,!0);return this},max:function(a){"string"==typeof a&&(a=g.parse(a));return a?(this._max=a,this):this._max},now:function(a){"string"==typeof a&&(a=g.parse(a));return a?(this._now=a,this): this._now},min:function(a){"string"==typeof a&&(a=g.parse(a));return a?(this._min=a,this):this._min},reset:function(){var a=this._nodes;this._min=this._params.min_date;this._now=this._params.now_date;this._max=this._params.max_date;g.count(this._now);a.items.chosen&&this.deselect();return this},select:function(){var a=0,c=0,b=0,c="",d=c=c=null,f=null,e=null,e=null,f=this._nodes.items,e=f.chosen,d=f.clicked,a=null;e&&(e.className=e.className.replace(" b-cal__day_is_chosen",""),e.getAttribute("data-stay")&& e.removeAttribute("data-stay"));e=f.chosen=d;a=e.getAttribute("data-day")-0;c=e.getAttribute("data-year")-0;b=e.getAttribute("data-month")-0;d=new Date(c,b,a);f.alias=c+"-"+b+"-"+a;e.className+=" b-cal__day_is_chosen";e=g.human(d);f=this._nodes.field;mirror=this._params.mirror;f&&(f[this._way]=this._tmpl(this._params.tmpl.stdout,e),mirror&&(mirror[this._way]=this._tmpl(this._params.tmpl.mirror,e)));this._tangled&&(a=this._tangled.instance,c=this._tangled.relation,f=a._nodes.field,mirror=a._params.mirror, e=""!=f[this._way]?g.parse(f[this._way]):null,">"==c?(c=this._max,d>=c?(e=c,d=new Date(e.getFullYear(),e.getMonth(),e.getDate()-1)):d>=e&&(e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)),a.min(d),f.focus(),a.jump(d)):"<"==c&&(c=this._min,d<=c?(e=c,d=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1)):d<=e&&(e=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1)),a.max(d)),f&&e&&(e=g.human(e),f[this._way]=this._tmpl(a._params.tmpl.stdout,e),mirror&&(mirror[this._way]=this._tmpl(a._params.tmpl.mirror, e))),this.hide());return this},deselect:function(){var a=this._nodes.items,c=a.chosen;c.className=c.className.replace(" b-cal__day_is_chosen","");a.alias="";a.chosen=null;this._tangled&&(this.reset(),this._tangled.instance.reset());return this},order:function(a,c){c=c||!1;a=a.sort(function(a,d){return a>d?1:-1});return"min"==c?a.shift():"max"==c?a.pop():a},parse:function(a){a=a||"";"string"!=typeof a&&"number"!=typeof a&&(a="");var c=0,b=0,d=0,f="",e=[],j=g.prototype,e=j._monthes2replaces(),h=new Date, i=j._default.lang.monthes.part;switch(a){case "now":case "today":return h;case "yesterday":return new Date(h.getFullYear(),h.getMonth(),h.getDate()-1);case "tomorrow":return new Date(h.getFullYear(),h.getMonth(),h.getDate()+1);case "next month":return new Date(h.getFullYear(),h.getMonth()+1);case "previous month":case "month ago":return new Date(h.getFullYear(),h.getMonth()-1);case "previous year":case "year ago":return new Date(h.getFullYear()-1,h.getMonth());case "next year":return new Date(h.getFullYear()+ 1,h.getMonth())}for(f in e)a=a.replace(RegExp("(^|\\s)"+f+"($|\\s)"),"$1"+i[e[f]]+"$2");a.match(/\d{4}/)||(a+=" "+h.getFullYear());dirt=new Date(a);if(dirt.getDate())return dirt;if(a.match(/\d{1,2}[\s\.,\/]\d{1,2}([\s\.,\/]\d{2,4})?/))e=a.split(/[\s\.,\/]/),c=e[0],d=e[1],e[2]&&(b=e[2]);else if(a.match(/\d{2,4}[\s\.,\/]\d{1,2}[\s\.,\/]\d{1,2}/))e=a.split(/[\s\.,\/]/),c=e[2],b=e[0],d=e[1];else if(e=a.match(RegExp("(\\d{1,2})[\\s\\.,\\/]("+i.join("|")+")([\\s\\.,\\/]\\d{4})?.*","i")))c=e[1],b=e[3],d= j._indexof(e[2],i);else if(e=a.match(RegExp("("+i.join("|")+")[\\s\\.,\\/](\\d{4})?.*","i")))b=e[2],d=j._indexof(e[1],i);else if(e=a.match(RegExp(".*("+i.join("|")+").*(\\d{4})?.*","i")))b=e[2],d=j._indexof(e[1],i);!c||1>c?c=1:2>c.length&&(c="0"+c);d||(d=0);b||(b=h.getFullYear());return new Date(b,d,c)},count:function(a){var a=a||new Date,c=42,b=null,d=null,d=null,f={},b=f.curr={};b.raw=new Date(a);b.day=b.raw.getDate();b.month=b.raw.getMonth();b.year=b.raw.getFullYear();b.till=(new Date(b.year,b.month+ 1,0)).getDate();b.from=1;b.beg=(new Date(b.year,b.month,1)).getDay();b.end=(new Date(b.year,b.month,b.till)).getDate();0==b.beg&&(b.beg=7);c-=b.till;d=f.prev={};d.raw=new Date(b.year,b.month-1);d.month=d.raw.getMonth();d.year=d.raw.getFullYear();d.till=(new Date(d.year,b.month,0)).getDate();d.from=d.till-(b.beg-2);d.total=d.till-d.from;c-=b.beg;d=f.next={};d.raw=new Date(b.year,b.month+1);d.month=d.raw.getMonth();d.year=d.raw.getFullYear();d.till=c+1;d.from=1;d.total=d.till-d.from;return f},inside:function(a, c,b){return a>c&&a<b?!0:!1},weekend:function(a,c,b){a=(new Date(a-0,c-0,b-0)).getDay();return 0==a||6==a?!0:!1},holiday:function(a,c,b){var b=b+"",a=a+"",d=c+1+"",f=g.prototype._holidays;1==d.length&&(d="0"+d);1==b.length&&(b="0"+b);return f?f.length&&-1!=g.prototype._indexof(a+""+("-"+d)+("-"+b),f)?!0:!1:g.weekend(a,c,b)},holidays:function(a){var c=0,b=0,d="",f=g.prototype._holidays=[];if(a&&a.length){b=a.length;for(c=0;c<b;c++)d=a[c],"object"==typeof d&&(d=d.year+"-"+d.month+"-"+d.day),f.push(d)}return f}, lang:function(a){var a=a||{},c="",b=g.prototype,d=b._default.lang;b._lang||(b._lang={});for(c in d)b._lang[c]=a[c]?a[c]:d[c];return this._lang},human:function(a){"string"==typeof a&&(a=g.parse(a));var c=0,c=a.getDate(),b=a.getFullYear(),d=a.getMonth()+1,f=a.getDay(),a=g.prototype._lang?g.prototype._lang:g.prototype._default.lang,b={days:new Date(b,d+1,-1),day:{num:c-0,nums:2>(c+"").length?"0"+c:c,week:1>f?7:f,full:"",part:""},year:{full:b,part:(b+"").substring(2),leap:1==new Date(b,1,29)?!0:!1},month:{num:d, nums:2>(d+"").length?"0"+d:d,full:"",decl:"",part:""}},c=b.day.week-1;b.day.full=a.weekdays.full[c];b.day.part=a.weekdays.part[c];c=b.month.num-1;b.month.full=a.monthes.full[c];b.month.decl=a.monthes.decl[c];b.month.part=a.monthes.part[c];return b},_install:function(){var a=0,c=null,b=null,d=null,f=null,e=null;this._params.no_tail||(b=document.createElement("div"),b.className="b-cal__tail-in",d=document.createElement("div"),d.className="b-cal__tail-out");f=document.createElement("div");f.className= "b-cal__hide";f.innerHTML=this._lang.hide;c=this._nodes.block=document.createElement("div");c.className="b-cal";0==document.documentElement.clientHeight&&(c.className+=" b-cal_mode_quirks");this._params.id&&(c.className+=" b-cal_id_"+this._params.id);this._nodes.prev=document.createElement("div");this._nodes.prev.className="b-cal__prev";this._nodes.next=document.createElement("div");this._nodes.next.className="b-cal__next";this._nodes.month=document.createElement("div");this._nodes.month.className= "b-cal__hat";this._nodes.days=document.createElement("div");this._nodes.days.className="b-cal__days";this._nodes.week=document.createElement("div");this._nodes.week.className="b-cal__week";for(a=0;7>a;a++)e=document.createElement("div"),e.className="b-cal__weekday",e.innerHTML=this._lang.weekdays.part[a],this._nodes.week.appendChild(e);this._params.no_tail?c.className+=" b-cal_no_tail":(c.appendChild(d),c.appendChild(b));c.appendChild(this._nodes.month);c.appendChild(this._nodes.prev);c.appendChild(this._nodes.next); c.appendChild(this._nodes.week);c.appendChild(this._nodes.days);c.appendChild(f);this._nodes.target.appendChild(c);this._alive();return this},_draw:function(a,c){var c=c||!1,b=!1,d=!1,f=!1,e=!1,j=0,h=0,i=0,n="",s=this._now.getFullYear()+"-"+this._now.getMonth()+"-"+this._now.getDate(),t=a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate(),m="",o=this._min,p=this._max,d=b=null,l=this._nodes,k=this._data=g.count(a),f=g.human(k.curr.raw),r=l.items.list=[],q=this._params.tmpl,u=this._nodes.items.alias;if(this._tangled&& this._tangled.instance._nodes.items.alias&&(m=this._tangled.instance._nodes.items.alias,b=m.split("-"),b[0]==k.curr.year&&b[1]==k.curr.month)){if("<"==this._tangled.relation&&b[2]==k.curr.end)return this.next();if(">"==this._tangled.relation&&1==b[2])return this.prev()}l.days.innerHTML="";l.month.innerHTML=this._tmpl(q.hat,f);h=k.prev.year;i=k.prev.month;b=g.inside(new Date(h,i,k.prev.till),o,p);l.prev.title=b?this._tmpl(q.prev,this.human(k.prev.raw,this._lang)):"";l.prev.className="b-cal__prev"+ (b?"":" b-cal__prev_is_disabled");for(j=k.prev.from;j<=k.prev.till;j++)e=g.holiday(h,i,j),d=this._day2node(j,i,h,"past",b,!1,e,m),l.days.appendChild(d),l.items.list.push(d);h=k.curr.year;i=k.curr.month;n=h+"-"+i+"-";for(j=k.curr.from;j<=k.curr.till;j++){f=d=!1;b=this.inside(new Date(h,i,j),o,p);e=g.holiday(h,i,j);b&&n+j==s&&(d=!0);if(n+j==u||c&&n+j==t)f=!0;d=this._day2node(j,i,h,"presence",b,d,e,m);l.days.appendChild(d);f&&(d.setAttribute("data-stay","on"),d.click());r.push(d)}h=k.next.year;i=k.next.month; b=this.inside(new Date(k.next.year,k.next.month,k.next.from),o,p,!0);l.next.title=b?this._tmpl(q.next,this.human(k.next.raw,this._lang)):"";l.next.className="b-cal__next"+(!b?" b-cal__next_is_disabled":"");for(j=k.next.from;j<=k.next.till;j++)e=g.holiday(h,i,j),d=this._day2node(j,i,h,"future",b,!1,e,m),l.days.appendChild(d),r.push(d);return!0},_day2node:function(a,c,b,d,f,e,g,h){var i=document.createElement("div");i.className="b-cal__day";i.innerHTML=a;if("presence"!=d||e)i.className+=" b-cal__day_in_"+ d;i.className=!f&&!e?i.className+" b-cal__day_is_disabled":i.className+" b-cal__day_is_enabled";g&&(i.className+=" b-cal__day_is_holiday");b+"-"+c+"-"+a==h&&(i.className+=" b-cal__day_is_tangled");i.setAttribute("data-month",c);i.setAttribute("data-year",b);i.setAttribute("data-day",a);return i},_monthes2replaces:function(){var a=0,c=0,b="",d={},a=g.prototype,f=null,e=a._lang&&a._lang.monthes?a._lang.monthes:a._default.lang.monthes;for(b in e){f=e[b];c=f.length;for(a=0;a<c;a++)d[f[a]]=a,d[f[a].toLowerCase()]= a}return d},_alive:function(){var a=this,c=this._nodes.block,b=this._nodes.field;b&&(b.setAttribute("autocomplete","off"),this._events.push(this._bind(document,"click",function(d){d=d.target;!d.className.match("b-cal")&&d!=b&&a.hide()})),this._events.push(this._bind(document,"keydown",function(b){27==b.keyCode&&a.shown&&a.hide()})),this._events.push(this._bind(b,"keydown",function(b){var c=b.keyCode;!b.ctrlKey&&(!b.metaKey&&!a.shown)&&a.show();switch(c){case 9:case 16:case 17:case 18:case 20:case 27:case 37:case 38:case 39:case 224:return!0; case 40:a.shown||a.show();break;case 13:a.shown&&(b.preventDefault(),a.hide());break;default:a._timer&&clearTimeout(a._timer),a._timer=setTimeout(a._proxy(a.jump,a),500)}})),this._events.push(this._bind(b,"mousedown",function(){a.shown||b.focus()})),this._events.push(this._bind(b,"focus",function(d){a.shown||(a._handlers.show?a._handlers.show.call(b,d,{done:a._proxy(a.show,a),hide:a._proxy(a.hide,a)}):a.show())})),this._events.push(this._bind(b,"click",function(){this.focus()})),this._events.push(this._bind(b, "click",function(b){!a.shown&&a.hiddenable&&(a._handlers.show?a._handlers.show.call(c,b,{done:a._proxy(a.show,a),hide:a._proxy(a.hide,a),reset:a._proxy(a.reset,a)}):a.show())})));this._events.push(this._bind(c,"click",function(b){var c=0,e=0,g=0,h=b.target,c=[];switch(h.className){case "b-cal__prev":a.prev();break;case "b-cal__next":a.next();break;case "b-cal__hide":a.hide();break;case "b-cal__day b-cal__day_is_enabled":case "b-cal__day b-cal__day_is_enabled b-cal__day_is_holiday":case "b-cal__day b-cal__day_in_past b-cal__day_is_enabled":case "b-cal__day b-cal__day_in_presence b-cal__day_is_enabled":case "b-cal__day b-cal__day_in_future b-cal__day_is_enabled":case "b-cal__day b-cal__day_in_past b-cal__day_is_enabled b-cal__day_is_holiday":case "b-cal__day b-cal__day_in_presence b-cal__day_is_enabled b-cal__day_is_holiday":case "b-cal__day b-cal__day_in_future b-cal__day_is_enabled b-cal__day_is_holiday":c= h.getAttribute("data-day");e=h.getAttribute("data-year");g=h.getAttribute("data-month");c={raw:new Date(e,g,c),field:a._nodes.field};c.human=a.human(c.raw,a._lang);a._nodes.items.clicked=h;a._handlers.select?a._handlers.select.call(h,b,{hide:a._proxy(a._hide,a),done:a._proxy(a.select,a),reset:a._proxy(a.reset,a),undone:a._proxy(a.deselect,a)},c):a.select();break;case "b-cal__day b-cal__day_is_enabled b-cal__day_is_chosen":case "b-cal__day b-cal__day_is_enabled b-cal__day_is_holiday b-cal__day_is_chosen":case "b-cal__day b-cal__day_in_presence b-cal__day_is_enabled b-cal__day_is_chosen":case "b-cal__day b-cal__day_in_presence b-cal__day_is_enabled b-cal__day_is_holiday b-cal__day_is_chosen":a._nodes.items.clicked= h;a._handlers.deselect?a._handlers.deselect.call(h,b,{done:a._proxy(a.deselect,a),hide:a._proxy(a._hide,a),reset:a._proxy(a.reset,a)}):a.deselect()}}));return this},_tmpl:function(a){a=a.replace(/\{\{ ?/g,"';out+=data.").replace(/ ?\}\}/g,";out+='");return eval("(function(){var out = '"+a+"';return out;})();")},_indexof:function(a,c){if(!c||"object"!=typeof c)return-1;var b=0;if(c.indexOf)return c.indexOf(a);for(b in c)if(c[b]==a)return b;return-1},_bind:function(a,c,b){var d="",f="",e=this,g={alias:c, target:a,handler:function(a){a=e._eventize(a);b(a)}};a.addEventListener?f="addEventListener":a.attachEvent&&(d="on",f="attachEvent");a[f](d+c,g.handler);return g},_unbind:function(a,c,b){var d="",f="";a.removeEventListener?f="removeEventListener":a.detachEvent&&(d="on",f="detachEvent");a[f](d+c,b)},_offsetize:function(a,c){for(var c=c||document.body,b=a,d=document.defaultView,f=null,e={top:b.offsetTop,left:b.offsetLeft,width:b.offsetWidth,height:b.offsetHeight};b.offsetParent&&b!=c;)b=b.offsetParent, f=d&&"undefined"!=d.getComputedStyle?d.getComputedStyle(b,null):b.currentStyle,f.paddingTop&&(e.top-=f.paddingTop.replace("px","")-0),e.top+=b.offsetTop,e.left+=b.offsetLeft;b.offsetParent&&(f=d&&"undefined"!=d.getComputedStyle?d.getComputedStyle(b.offsetParent,null):b.offsetParent.currentStyle,f.paddingTop&&(e.top-=f.paddingTop.replace("px","")-0));return e},_eventize:function(a){var a=a||window.event,c=navigator.userAgent.match(/opera/ig)?!0:!1,b=a.type;!c&&a.srcElement&&(a.target=a.srcElement); !c&&3==a.target.nodeType&&(a.target=a.target.parentNode);if(("keypress"==b||"keydown"==b||"keyup"==b)&&!a.keyCode&&a.which)a.keyCode=a.which;!c&&!a.stopPropagation&&(a.stopPropagation=function(){this.cancelBubble=true});!c&&!a.preventDefault&&(a.preventDefault=function(){this.returnValue=false});return a},_proxy:function(a,c){return function(){return a.apply(c,arguments)}}};g.lang=g.prototype.lang;g.human=g.prototype.human;g.order=g.prototype.order;g.count=g.prototype.count;g.parse=g.prototype.parse; g.inside=g.prototype.inside;g.weekend=g.prototype.weekend;g.holiday=g.prototype.holiday;g.holidays=g.prototype.holidays;return g}