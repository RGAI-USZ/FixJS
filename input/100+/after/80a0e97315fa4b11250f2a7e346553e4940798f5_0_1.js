function ($) {
    function show_test_case (node_id) {
	$.ajax({
	    url: IMPASSE.url.executionsEdit,
	    data: {
		"test_plan_case[test_plan_id]": test_plan_id,
		"test_plan_case[test_case_id]": node_id
	    },
	    success: function(html) {
		$("#executions-view").empty().append($(html));
		$("span.label", $("#executions-view"))
		    .css({cursor:'pointer'})
		    .click(function(e) {
			$(this).prev().attr("checked", "checked");
		    });
	    },
	    error: ajax_error_handler,
	    complete: function() { $("#executions-view").unblock(); }
	});
    }

    function bind_node_event (e, data) {
	$(this).find("li[rel=test_case]").click(function(e) {
	    var $node = $(this);
	    $("#executions-view").block(impasse_loading_options());
	    show_test_case($(this).attr("id").replace("exec_", ""));
	});
    }

    var $tree = $("#testplan-tree")
	.bind("loaded.jstree refresh.jstree", bind_node_event)
	.jstree({ 
	    "plugins" : [
		"themes","json_data","ui","crrm","search","types","hotkeys"
	    ],
	    json_data : { 
		ajax : {
		    url : IMPASSE.url.executionsList,
		    data : function (n) { 
			var params = { 
			    prefix: "exec",
			    id : n.attr ? n.attr("id").replace("exec_","") : -1
			};
			if ($("#filters #cb_myself").is(":checked")) {
			    params["myself"] = true;
			}
			params["execution_status"] = $("#filters :checkbox[name=execution_status]:checked").map(function() {
			    return $(this).val();
			}).get();
			return params;
		    },
		    complete: function() { $("#testplan-tree").unblock(); }
		}
	    },
	    types: {
		max_depth: -2,
		max_children: -2,
		valid_children: [ "test_project" ],
		types: {
		    test_case: {
			valid_children: "none",
			icon: { image: IMPASSE.url.iconTestCase }
		    },
		    test_suite: {
			valid_children: [ "test_suite", "test_case" ],
			icon: { image: IMPASSE.url.iconTestSuite }
		    },
		    test_project: {
			valid_children: [ "test_suite", "test_case" ],
			icon: { image: IMPASSE.url.iconProject },
			start_drag: false,
			move_node: false,
			delete_node: false,
			remove: false
		    }
		}
	    }
	});

    $("p.buttons a.icon.icon-checked").click(function(e) {
	$("#testplan-tree").block(impasse_loading_options());
	$tree.jstree("refresh", -1);
	return false;
    });
    $("#executions-view form").live("submit", function(e) {
	var $this = $(this);
	var post_save_function = function() { $.unblockUI() };
	var execution_status = $this.find(":radio[name='execution[status]']:checked").val();
	if(execution_status == "2") { // NG
	    post_save_function = function() {
		$.get(IMPASSE.url.executionBugsNew, {},
			function(data) {
			    $.unblockUI();
			    $("#issue-dialog").html(data).dialog({
				modal:true,
				minWidth: 800,
				zIndex: 50,
				title: IMPASSE.label.issueNew
			    });
			});
	    };
	}
	$.ajax({
	    url: IMPASSE.url.executionsPut,
	    type: 'POST',
	    data: $this.serialize() + "&format=json",
	    success: function(data) {
		show_notification_dialog(data.status, data.message);
		
		post_save_function();
		var test_case_id = $(":hidden[name='test_plan_case[test_case_id]']" ,$this).val();
		$("#testplan-tree li#exec_"+test_case_id+" a  ins").css({backgroundImage: "url("+EXEC_ICONS[execution_status]+")"});
	    },
	    error: function(data) {
		$.unblockUI();
	    }
	});
	$.blockUI({ message: "<h1>Saving...</h1>"});
	return false;
    });

    $("#issue-dialog form").live("submit", function(e) {
	var $this = $(this);
	$.ajax({
	    url: IMPASSE.url.executionBugsCreate,
	    type: 'POST',
	    data: $this.serialize()
		+ "&execution_bug[execution_id]="+ $("#executions-view :hidden#execution_id").val()
		+"&format=json",
	    success: function(data) {
		if (data.errors) {
		    if ($("#issue-dialog .errorExplanation").size() == 0)
			$("#issue-dialog").prepend($("<div/>").addClass("errorExplanation").attr("id", "errorExplanation"));
		    var list = $("<ul/>");
		    $.each(data.errors, function(i, msg) {
			list.append($("<li/>").text(msg));
		    });
		    $("#issue-dialog #errorExplanation").html(list);
		    return;
		}
		var bugs = $("#execution-bugs-list");
		 
		if (bugs)
		    bugs.append(",");
		bugs.append($("<a/>")
			    .attr("href", IMPASSE.url.issue + "/" + data['issue_id'])
			    .text("#" + data['issue_id']))
		    .parents("p:first").show();
		$("#issue-dialog").dialog("close");
	    },
	    complete: function() { $("#issue-dialog").unblock() }
	});
	$("#issue-dialog").block({message:"<h1>Saving...</h1>"})
	return false;
    });

    $("#executions-view").floatmenu();
    if (location.hash && location.hash.lastIndexOf("#testcase-", 0) == 0) {
	var testcase_id = location.hash.replace(/^#testcase-/, "");
	show_test_case(testcase_id);
    }

    $("input[name=execution_status]").change(function() {
	var checked = $("input[name=execution_status]:checked");
	if (checked.size() > 0) {
	    $("#cb_execution_status_all").removeAttr("checked").removeAttr("disabled")
		.one("change", function() {
		    $("input[name=execution_status]").removeAttr("checked");
		    $("#cb_execution_status_all").attr("checked", "checked").attr("disabled", "disabled");
		});
	} else {
	    $("#cb_execution_status_all").attr("checked", "checked").attr("disabled", "disabled")
		.unbind("change");
	}
    });
}