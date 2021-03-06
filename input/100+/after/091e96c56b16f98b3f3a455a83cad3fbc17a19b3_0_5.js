function(scope, elm, attrs, ngModel) {
			var expression,
			  options = {
				// Update model on button click
				onchange_callback: function(inst) {
					if (inst.isDirty()) {
						inst.save();
						ngModel.$setViewValue(elm.val());
                           scope.$apply();
					}
				},
				// Update model on keypress
				handle_event_callback: function(e) {
					if (this.isDirty()) {
						this.save();
						ngModel.$setViewValue(elm.val());
                           scope.$apply();
					}
					return true; // Continue handling
				},
				// Update model when calling setContent (such as from the source editor popup)
				setup : function(ed) {
					ed.onSetContent.add(function(ed, o) {
						if (ed.isDirty()) {
							ed.save();
							ngModel.$setViewValue(elm.val());
							scope.$apply();
						}
					});
				}
			};
			if (attrs.uiTinymce) {
				expression = scope.$eval(attrs.uiTinymce);
			} else {
				expression = {};
			}
			angular.extend(options, uiConfig.tinymce, expression);
			setTimeout(function(){
				elm.tinymce(options);
			});
		}