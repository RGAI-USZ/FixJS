function(){$(".add_filter_button").live("click",function(){var a=new Array();var b=new Array();var c=null;var d=null;$(this).closest(".add_filter_div").children().each(function(){if(($(this).hasClass("add_filter")||$(this).hasClass("and_filter"))&&$(this).children("input")[0].value!=="")a.push($(this).children("input")[0].value);else if($(this).hasClass("not_filter")&&$(this).children("input")[0].value!=="")b.push($(this).children("input")[0].value);else if($(this).hasClass("size_filter")){var e=$(this).children("input")[0].value;var f=$(this).children("select")[1].value;var g=$(this).children("input")[1].value;var h=$(this).children("select")[2].value;if(!(e==""&&g==""))if(!c){if(e=="")e=0;if(g=="")g=0;e*=f;g*=h;c=new Array(e,g);}else{alert("More than one size limit has been specified, remove the second and try again");d=true;return;}}});if(d)return false;if(c)c=c.join("||||||");else c="";if(a.length==0)a="";else a=a.join("||||||");if(b.length==0)b="";else b=b.join("||||||");var e=$(this).closest(".remote_setting").attr("id").split("remote_settings_")[1];if(a==""&&b==""&&c==""){}else{var f="request=add_filter&name="+e;f+="&positive="+encodeURIComponent(a);f+="&negative="+encodeURIComponent(b);f+="&sizelim="+encodeURIComponent(c);socket.send(f);}});$(".filter_group").live("click",function(){var a=$(this).closest(".remote_setting").attr("id").split("remote_settings_")[1];var b=$(".filter_group",$(this).parent()).index($(this));var c=confirm("Are you sure you want to remove this filter?");if(c)socket.send("request=remove_filter&name="+a+"&index="+b);});$("#dialog_form").dialog({autoOpen:false,height:300,width:350,modal:true,buttons:{"Submit":function(){var a=$("#password").val();var b=hashPassword(a);args.auth=b;var c=[];$.each(args,function(a,b){c.push(a+"="+encodeURIComponent(b));});var d=c.join("&");socket.send(d);$(this).dialog("close");},"Cancel":function(){$(this).dialog("close");}},close:function(){$("#password").val("");args=null;}});$(".remote_row").live("click",function(a){var b=$(this).next();if(b.hasClass("is_hidden"))b.removeClass("is_hidden");else b.addClass("is_hidden");});$("input").live("keydown",function(a){$(this).prev().css({color:"","font-weight":"","font-style":""});});$(".submit_button").live("click",function(a){var b=$("input",$(this).parent().parent());args=new Object();args.tocrypt=[];var c=false;b.each(function(a){var b=$(this).attr("name");var d=$(this).attr("value");if(!d){$(this).prev().css({color:"red","font-weight":"bold","font-style":"italic"});c=true;}else args[b]=d;});if(c)return false;else{args.request="set_source";args.name=$(this).attr("id").split("submit_")[1];$("#dialog_form").dialog("open");}});});function runSocketInit(){socket.send("request=get_sources");}function runSocketPostInit(){$(".bot_button").live("click",function(){if($(this).attr("id").indexOf("start_")!==-1){var a=$(this).attr("id").split("start_")[1];socket.send("request=start_bot&arguments="+a);}else{var a=$(this).attr("id").split("stop_")[1];socket.send("request=stop_bot&arguments="+a);}});}function onOpen(a){console.log("autoSocket opened",a,socket);runSocketInit();}function onMessage(a){if(a.data.indexOf("ERROR")===0){console.log(a.data);socket.close();}else{var b=JSON.parse(a.data);if(b.request=="get_sources"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);return false;}var c=$("div#available").remove();var d=$("table#available > tbody");for(i=0;i<b.response.length;i++){d.append($(b.response[i].row));d.append($(b.response[i].req_row));}runSocketPostInit();}else if(b.request=="get_source_single"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);return false;}refresh_drop_down_respond(b.response);}else if(b.request=="add_filter"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);return false;}refresh_drop_down(b.name);}else if(b.request=="start_bot"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);refresh_drop_down(b.name);return false;}setTimeout(function(){refresh_drop_down(b.name);},2000);}else if(b.request=="stop_bot"){if(b.error)console.log("ERROR in request "+b.request+": "+b.error);refresh_drop_down(b.name);}else if(b.request=="remove_filter"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);return false;}refresh_drop_down(b.name);}else if(b.request=="set_source"){if(b.error){console.log("ERROR in request "+b.request+": "+b.error);return false;}refresh_drop_down(b.name);}else console.log("socket message:",a.data);}}function refresh_drop_down(a){socket.send("request=get_source_single&arguments="+a);}function refresh_drop_down_respond(a){var b=$(a.req_row);var c=b.attr("id").split("remote_settings_")[1];var d=$(".bot_button",b).attr("id");if(d.indexOf("start_")==0)$(".status-"+c).html("off").removeClass("status-on").addClass("status-off");else $(".status-"+c).html("on").removeClass("status-off").addClass("status-on");$("#remote_settings_"+c).html(b.html());}