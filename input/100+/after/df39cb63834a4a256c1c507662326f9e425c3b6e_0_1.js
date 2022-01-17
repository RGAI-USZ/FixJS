function(validator, errorMap, errorList) {

		if (this.trackFormChanges_ && !this.formChangesCurrentlyTracked_) {
			$.pkp.controllers.SiteHandler.prototype.registerUnsavedFormElement(
					this.getHtmlElement());
			this.formChangesCurrentlyTracked_ = true;
		}
		// ensure that rich content elements have their
		// values stored before validation.
		if (typeof tinyMCE !== 'undefined') {
			tinyMCE.triggerSave();
		}

		// Show errors generated by the form change.
		validator.defaultShowErrors();

		// Emit validation events.
		if (validator.checkForm()) {
			// Trigger a "form valid" event.
			this.trigger('formValid');
		} else {
			// Trigger a "form invalid" event.
			this.trigger('formInvalid');
			this.enableFormControls_();
		}
	}