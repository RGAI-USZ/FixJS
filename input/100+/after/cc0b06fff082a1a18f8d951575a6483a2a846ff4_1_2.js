fs[a.id]=a;return a.id}function t(a){h.setTimeout(function(){s[a]=f;delete s[a]},0)}function u(){return d}function v(a,b,c,e){var k=g;l(b)&&(b=h);try{k=a.call(b)}catch(x){if(c===d)throw Error(e).k=x,x;}return k}function r(a,b,c){if("ready"===a)a=u;else if(!j(a))throw Error("defer:01");if(!j(b))throw Error("defer:02");var e=c||{};this.id=w++;this.i=a;this.g=b;e.e=c.interval||50;e.timeout=c.timeout||15E3;this.options=e;this.c=l(c.testDOMReady)?d:!!c.testDOMReady;this.d=this.b=f;this.j=this.a=g;var k;
