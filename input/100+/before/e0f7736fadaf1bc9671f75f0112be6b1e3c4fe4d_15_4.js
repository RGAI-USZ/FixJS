function(){var c=a.data(this,"datalistWidget");return c?c._autocomplete:"autocomplete"in this?this.autocomplete:this.getAttribute("autocomplete")},set:function(c){var d=a.data(this,"datalistWidget");d?(d._autocomplete=c,"off"==c&&d.hideList()):"autocomplete"in this?this.autocomplete=c:this.setAttribute("autocomplete",
c)}}}};if(!p||!1 in a("<input />")[0])c.selectedOption={prop:{writeable:!1,get:function(){var c=a.prop(this,"list"),d=null,i;if(!c)return d;i=a.attr(this,"value");if(!i)return d;c=a.prop(c,"options");if(!c.length)return d;a.each(c,function(b,c){if(i==a.prop(c,"value"))return d=c,!1});return d}}};c.list=p?{attr:{get:function(){var c=d.contentAttr(this,"list");null!=c?this.removeAttribute("list"):c=a.data(this,"datalistListAttr");return null==c?m:c},set:function(c){