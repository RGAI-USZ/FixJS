function(a,b,c,d,e,f,g){"use strict",typeof d=="object"?e.exports=f(c("underscore"),c("backbone"),c("backbone.marionette")):typeof b=="function"&&b.amd?b(["underscore","backbone","backbone.marionette"],function(b,c){return b=b===g?a._:b,c=c===g?a.Backbone:c,a.returnExportsGlobal=f(b,c,a)}):a.returnExportsGlobal=f(a._,a.Backbone)})(this,this.define,this.require,this.exports,this.module,function(a,b,c,d){"use strict";var e,f,g;return e=b.Marionette.View.prototype.getTemplateSelector,b.Marionette.View.prototype.getTemplateSelector=function(){var b;return this.options&&this.options.template?b=this.options.template:b=this.template,a.isObject(b)&&b.type==="handlebars"?b:a.bind(e,this)()},f=b.Marionette.TemplateCache.get,b.Marionette.TemplateCache.get=function(b){return a.isObject(b)&&b.type==="handlebars"?b:a.bind(f,this)(b)},g=b.Marionette.Renderer.renderTemplate,b.Marionette.Renderer.renderTemplate=function(a,b){if(a!==null)return a.template(b,a.options)},b.Marionette}