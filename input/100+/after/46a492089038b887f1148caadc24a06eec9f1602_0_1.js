function() {
      var elementId = $(this).attr("id");
      if (elementId == undefined) {
        console.log("Element must have an ID; multiple file upload behaviour has not been enabled.");
        return;
      }
      var lastFileInputSelector = "#" + elementId + " input[type=file]:last";
      $(this).delegate(lastFileInputSelector, "change", function() {
        var clone = $(this).parents(".file_upload").clone();
        var referenceInput = clone.children("input:first")[0];
        var id = parseInt($(referenceInput).attr("id").match(/_(\d+)_/)[1]);
        var newId = id + 1;
        clone.find(".field_with_errors label,input").unwrap();
        clone.children("label").each(function(i, el) {
          $(el).attr("for", $(el).attr("for").replace("_"+id+"_", "_"+newId+"_"));
        });
        clone.children("input,textarea").each(function(i, el) {
          $(el).attr("id", $(el).attr("id").replace("_"+id+"_", "_"+newId+"_"));
          $(el).attr("name", $(el).attr("name").replace("["+id+"]", "["+newId+"]"));
        });
        clone.children("input").val("");
        clone.children(".already_uploaded").text("");
        $(this).parent().after(clone);
      });
    }