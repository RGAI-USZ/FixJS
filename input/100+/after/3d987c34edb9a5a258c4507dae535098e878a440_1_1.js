function(a,b,c,d,e,f,g){"use strict",typeof d=="object"?e.exports=f(c("underscore"),c("backbone"),c("backbone.marionette")):typeof b=="function"&&b.amd?b(["underscore","backbone","backbone.marionette"],function(b,c){return b=b===g?a._:b,c=c===g?a.Backbone:c,a.returnExportsGlobal=f(b,c,a)}):a.returnExportsGlobal=f(a._,a.Backbone)})(this,this.define,this.require,this.exports,this.module,function(a,b,c,d){"use strict";var e;return e=b.Marionette.Renderer.render,b.Marionette.Renderer.render=function(b,c){return a.isObject(b)&&b.type==="handlebars"?b.template(c,b.options):e(b,c)},b.Marionette}