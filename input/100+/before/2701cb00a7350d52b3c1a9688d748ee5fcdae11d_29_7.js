function(){d.changedValue&&a(d.input).trigger("change");d.changedValue=!1};d.shadowList.removeClass("datalist-visible list-item-active");d.index=-1;d.isListVisible=!1;if(d.changedValue){d.triggeredByDatalist=!0;b.triggerInlineForm&&b.triggerInlineForm(d.input,"input");if(d.input==i.activeElement||a(d.input).is(":focus"))a(d.input).one("blur",g);else g();d.triggeredByDatalist=!1}