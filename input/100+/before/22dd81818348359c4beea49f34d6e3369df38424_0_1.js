function($, my) {
// ## (Data) Grid Dataset View
//
// Provides a tabular view on a Dataset.
//
// Initialize it with a `recline.Model.Dataset`.
my.Grid = Backbone.View.extend({
  tagName:  "div",
  className: "recline-grid-container",

  initialize: function(modelEtc) {
    var self = this;
    this.el = $(this.el);
    _.bindAll(this, 'render', 'onHorizontalScroll');
    this.model.records.bind('add', this.render);
    this.model.records.bind('reset', this.render);
    this.model.records.bind('remove', this.render);
    this.tempState = {};
    var state = _.extend({
        hiddenFields: []
      }, modelEtc.state
    ); 
    this.state = new recline.Model.ObjectState(state);
  },

  events: {
    'click .column-header-menu .data-table-menu li a': 'onColumnHeaderClick',
    'click .row-header-menu': 'onRowHeaderClick',
    'click .root-header-menu': 'onRootHeaderClick',
    'click .data-table-menu li a': 'onMenuClick',
    // does not work here so done at end of render function
    // 'scroll .recline-grid tbody': 'onHorizontalScroll'
  },

  // ======================================================
  // Column and row menus

  onColumnHeaderClick: function(e) {
    this.tempState.currentColumn = $(e.target).closest('.column-header').attr('data-field');
  },

  onRowHeaderClick: function(e) {
    this.tempState.currentRow = $(e.target).parents('tr:first').attr('data-id');
  },
  
  onRootHeaderClick: function(e) {
    var tmpl = ' \
        {{#columns}} \
        <li><a data-action="showColumn" data-column="{{.}}" href="JavaScript:void(0);">Show column: {{.}}</a></li> \
        {{/columns}}';
    var tmp = Mustache.render(tmpl, {'columns': this.state.get('hiddenFields')});
    this.el.find('.root-header-menu .dropdown-menu').html(tmp);
  },

  onMenuClick: function(e) {
    var self = this;
    e.preventDefault();
    var actions = {
      bulkEdit: function() { self.showTransformColumnDialog('bulkEdit', {name: self.tempState.currentColumn}); },
      facet: function() { 
        self.model.queryState.addFacet(self.tempState.currentColumn);
      },
      facet_histogram: function() {
        self.model.queryState.addHistogramFacet(self.tempState.currentColumn);
      },
      filter: function() {
        self.model.queryState.addTermFilter(self.tempState.currentColumn, '');
      },
      sortAsc: function() { self.setColumnSort('asc'); },
      sortDesc: function() { self.setColumnSort('desc'); },
      hideColumn: function() { self.hideColumn(); },
      showColumn: function() { self.showColumn(e); },
      deleteRow: function() {
        var self = this;
        var doc = _.find(self.model.records.models, function(doc) {
          // important this is == as the currentRow will be string (as comes
          // from DOM) while id may be int
          return doc.id == self.tempState.currentRow;
        });
        doc.destroy().then(function() { 
            self.model.records.remove(doc);
            self.trigger('recline:flash', {message: "Row deleted successfully"});
          }).fail(function(err) {
            self.trigger('recline:flash', {message: "Errorz! " + err});
          });
      }
    };
    actions[$(e.target).attr('data-action')]();
  },

  showTransformColumnDialog: function() {
    var self = this;
    var view = new my.ColumnTransform({
      model: this.model
    });
    // pass the flash message up the chain
    view.bind('recline:flash', function(flash) {
      self.trigger('recline:flash', flash);
    });
    view.state = this.tempState;
    view.render();
    this.el.append(view.el);
    view.el.modal();
  },

  setColumnSort: function(order) {
    var sort = [{}];
    sort[0][this.tempState.currentColumn] = {order: order};
    this.model.query({sort: sort});
  },
  
  hideColumn: function() {
    var hiddenFields = this.state.get('hiddenFields');
    hiddenFields.push(this.tempState.currentColumn);
    this.state.set({hiddenFields: hiddenFields});
    // change event not being triggered (because it is an array?) so trigger manually
    this.state.trigger('change');
    this.render();
  },
  
  showColumn: function(e) {
    var hiddenFields = _.without(this.state.get('hiddenFields'), $(e.target).data('column'));
    this.state.set({hiddenFields: hiddenFields});
    this.render();
  },

  onHorizontalScroll: function(e) {
    var currentScroll = $(e.target).scrollLeft();
    this.el.find('.recline-grid thead tr').scrollLeft(currentScroll);
  },

  // ======================================================
  // #### Templating
  template: ' \
    <div class="table-container"> \
    <table class="recline-grid table-striped table-condensed" cellspacing="0"> \
      <thead class="fixed-header"> \
        <tr> \
          {{#notEmpty}} \
            <th class="column-header"> \
              <div class="btn-group root-header-menu"> \
                <a class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a> \
                <ul class="dropdown-menu data-table-menu"> \
                </ul> \
              </div> \
              <span class="column-header-name"></span> \
            </th> \
          {{/notEmpty}} \
          {{#fields}} \
            <th class="column-header {{#hidden}}hidden{{/hidden}}" data-field="{{id}}" style="width: {{width}}px; max-width: {{width}}px; min-width: {{width}}px;"> \
              <div class="btn-group column-header-menu"> \
                <a class="btn dropdown-toggle" data-toggle="dropdown"><i class="icon-cog"></i><span class="caret"></span></a> \
                <ul class="dropdown-menu data-table-menu pull-right"> \
                  <li><a data-action="facet" href="JavaScript:void(0);">Term Facet</a></li> \
                  <li><a data-action="facet_histogram" href="JavaScript:void(0);">Date Histogram Facet</a></li> \
                  <li><a data-action="filter" href="JavaScript:void(0);">Text Filter</a></li> \
                  <li class="divider"></li> \
                  <li><a data-action="sortAsc" href="JavaScript:void(0);">Sort ascending</a></li> \
                  <li><a data-action="sortDesc" href="JavaScript:void(0);">Sort descending</a></li> \
                  <li class="divider"></li> \
                  <li><a data-action="hideColumn" href="JavaScript:void(0);">Hide this column</a></li> \
                  <li class="divider"></li> \
                  <li class="write-op"><a data-action="bulkEdit" href="JavaScript:void(0);">Transform...</a></li> \
                </ul> \
              </div> \
              <span class="column-header-name">{{label}}</span> \
            </th> \
          {{/fields}} \
          <th class="last-header" style="width: {{lastHeaderWidth}}px; max-width: {{lastHeaderWidth}}px; min-width: {{lastHeaderWidth}}px; padding: 0; margin: 0;"></th> \
        </tr> \
      </thead> \
      <tbody class="scroll-content"></tbody> \
    </table> \
    </div> \
  ',

  toTemplateJSON: function() {
    var self = this; 
    var modelData = this.model.toJSON();
    modelData.notEmpty = ( this.fields.length > 0 );
    // TODO: move this sort of thing into a toTemplateJSON method on Dataset?
    modelData.fields = _.map(this.fields, function(field) {
      return field.toJSON();
    });
    // last header width = scroll bar - border (2px) */
    modelData.lastHeaderWidth = this.scrollbarDimensions.width - 2;
    return modelData;
  },
  render: function() {
    var self = this;
    this.fields = this.model.fields.filter(function(field) {
      return _.indexOf(self.state.get('hiddenFields'), field.id) == -1;
    });
    this.scrollbarDimensions = this.scrollbarDimensions || this._scrollbarSize(); // skip measurement if already have dimensions
    var numFields = this.fields.length;
    // compute field widths (-20 for first menu col + 10px for padding on each col and finally 16px for the scrollbar)
    var fullWidth = self.el.width() - 20 - 10 * numFields - this.scrollbarDimensions.width;
    var width = parseInt(Math.max(50, fullWidth / numFields));
    // if columns extend outside viewport then remainder is 0 
    var remainder = Math.max(fullWidth - numFields * width,0);
    _.each(this.fields, function(field, idx) {
      // add the remainder to the first field width so we make up full col
      if (idx == 0) {
        field.set({width: width+remainder});
      } else {
        field.set({width: width});
      }
    });
    var htmls = Mustache.render(this.template, this.toTemplateJSON());
    this.el.html(htmls);
    this.model.records.forEach(function(doc) {
      var tr = $('<tr />');
      self.el.find('tbody').append(tr);
      var newView = new my.GridRow({
          model: doc,
          el: tr,
          fields: self.fields
        });
      newView.render();
    });
    // hide extra header col if no scrollbar to avoid unsightly overhang
    var $tbody = this.el.find('tbody')[0];
    if ($tbody.scrollHeight <= $tbody.offsetHeight) {
      this.el.find('th.last-header').hide();
    }
    this.el.find('.recline-grid').toggleClass('no-hidden', (self.state.get('hiddenFields').length === 0));
    this.el.find('.recline-grid tbody').scroll(this.onHorizontalScroll);
    return this;
  },

  // ### _scrollbarSize
  // 
  // Measure width of a vertical scrollbar and height of a horizontal scrollbar.
  //
  // @return: { width: pixelWidth, height: pixelHeight }
  _scrollbarSize: function() {
    var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
    var dim = { width: $c.width() - $c[0].clientWidth + 1, height: $c.height() - $c[0].clientHeight };
    $c.remove();
    return dim;
  }
});

// ## GridRow View for rendering an individual record.
//
// Since we want this to update in place it is up to creator to provider the element to attach to.
//
// In addition you *must* pass in a FieldList in the constructor options. This should be list of fields for the Grid.
//
// Example:
//
// <pre>
// var row = new GridRow({
//   model: dataset-record,
//     el: dom-element,
//     fields: mydatasets.fields // a FieldList object
//   });
// </pre>
my.GridRow = Backbone.View.extend({
  initialize: function(initData) {
    _.bindAll(this, 'render');
    this._fields = initData.fields;
    this.el = $(this.el);
    this.model.bind('change', this.render);
  },

  template: ' \
      <td> \
        <div class="btn-group row-header-menu"> \
          <a class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></a> \
          <ul class="dropdown-menu data-table-menu"> \
            <li class="write-op"><a data-action="deleteRow" href="JavaScript:void(0);">Delete this row</a></li> \
          </ul> \
        </div> \
      </td> \
      {{#cells}} \
      <td data-field="{{field}}" style="width: {{width}}px; max-width: {{width}}px; min-width: {{width}}px;"> \
        <div class="data-table-cell-content"> \
          <a href="javascript:{}" class="data-table-cell-edit" title="Edit this cell">&nbsp;</a> \
          <div class="data-table-cell-value">{{{value}}}</div> \
        </div> \
      </td> \
      {{/cells}} \
    ',
  events: {
    'click .data-table-cell-edit': 'onEditClick',
    'click .data-table-cell-editor .okButton': 'onEditorOK',
    'click .data-table-cell-editor .cancelButton': 'onEditorCancel'
  },
  
  toTemplateJSON: function() {
    var self = this;
    var doc = this.model;
    var cellData = this._fields.map(function(field) {
      return {
        field: field.id,
        width: field.get('width'),
        value: doc.getFieldValue(field)
      };
    });
    return { id: this.id, cells: cellData };
  },

  render: function() {
    this.el.attr('data-id', this.model.id);
    var html = Mustache.render(this.template, this.toTemplateJSON());
    $(this.el).html(html);
    return this;
  },

  // ===================
  // Cell Editor methods

  cellEditorTemplate: ' \
    <div class="menu-container data-table-cell-editor"> \
      <textarea class="data-table-cell-editor-editor" bind="textarea">{{value}}</textarea> \
      <div id="data-table-cell-editor-actions"> \
        <div class="data-table-cell-editor-action"> \
          <button class="okButton btn primary">Update</button> \
          <button class="cancelButton btn danger">Cancel</button> \
        </div> \
      </div> \
    </div> \
  ',

  onEditClick: function(e) {
    var editing = this.el.find('.data-table-cell-editor-editor');
    if (editing.length > 0) {
      editing.parents('.data-table-cell-value').html(editing.text()).siblings('.data-table-cell-edit').removeClass("hidden");
    }
    $(e.target).addClass("hidden");
    var cell = $(e.target).siblings('.data-table-cell-value');
    cell.data("previousContents", cell.text());
    var templated = Mustache.render(this.cellEditorTemplate, {value: cell.text()});
    cell.html(templated);
  },

  onEditorOK: function(e) {
    var self = this;
    var cell = $(e.target);
    var rowId = cell.parents('tr').attr('data-id');
    var field = cell.parents('td').attr('data-field');
    var newValue = cell.parents('.data-table-cell-editor').find('.data-table-cell-editor-editor').val();
    var newData = {};
    newData[field] = newValue;
    this.model.set(newData);
    this.trigger('recline:flash', {message: "Updating row...", loader: true});
    this.model.save().then(function(response) {
        this.trigger('recline:flash', {message: "Row updated successfully", category: 'success'});
      })
      .fail(function() {
        this.trigger('recline:flash', {
          message: 'Error saving row',
          category: 'error',
          persist: true
        });
      });
  },

  onEditorCancel: function(e) {
    var cell = $(e.target).parents('.data-table-cell-value');
    cell.html(cell.data('previousContents')).siblings('.data-table-cell-edit').removeClass("hidden");
  }
});

}