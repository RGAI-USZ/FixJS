function(f,h,g){var b=l.createElement(f),o=c.getPrototypeOf(b);if(i&&o&&a!==o&&(!b[h]||!d.call(b,h))){var k=b[h];g._supvalue=function(){return k&&k.apply?k.apply(this,arguments):k};o[h]=g.value}else g._supvalue=function(){var a=p(this,"propValue");return a&&a[h]&&a[h].apply?a[h].apply(this,arguments):a&&a[h]},m.extendValue(f,h,g.value);g.value._supvalue=g._supvalue}}(),m=function(){var e={}