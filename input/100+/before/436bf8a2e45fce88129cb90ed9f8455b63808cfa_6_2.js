function() {
  var iced, update_scheme, __iced_k,
    __slice = [].slice;

  iced = {
    Deferrals: (function() {

      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) return this.continuation(this.ret);
      };

      _Class.prototype.defer = function(defer_params) {
        var _this = this;
        ++this.count;
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    }
  };
  __iced_k = function() {};

  update_scheme = {
    "type": "obj",
    "children": [
      {
        "name": "description",
        "props": {
          "type": "text",
          "optional": true,
          "title": "\u05d3\u05d1\u05e8\u05d9 \u05d4\u05e1\u05d1\u05e8"
        }
      }, {
        "name": "implementation_status",
        "props": {
          "type": "select",
          "options": [["NEW", "\u05d8\u05e8\u05dd \u05d4\u05ea\u05d7\u05d9\u05dc"], ["STUCK", "\u05ea\u05e7\u05d5\u05e2"], ["IN_PROGRESS", "\u05d1\u05ea\u05d4\u05dc\u05d9\u05da"], ["FIXED", "\u05d9\u05d5\u05e9\u05dd \u05d1\u05de\u05dc\u05d5\u05d0\u05d5"], ["WORKAROUND", "\u05d9\u05d5\u05e9\u05dd \u05d7\u05dc\u05e7\u05d9\u05ea"], ["IRRELEVANT", "\u05d9\u05d9\u05e9\u05d5\u05dd \u05d4\u05d4\u05de\u05dc\u05e6\u05d4 \u05db\u05d1\u05e8 \u05dc\u05d0 \u05e0\u05d3\u05e8\u05e9"]],
          "title": "\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d9\u05d9\u05e9\u05d5\u05dd"
        }
      }, {
        "name": "implementation_status_text",
        "props": {
          "type": "text",
          "optional": true,
          "title": "\u05d4\u05e1\u05d1\u05e8 \u05dc\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d4\u05d9\u05d9\u05e9\u05d5\u05dd"
        }
      }, {
        "name": "links",
        "props": {
          "type": "arr",
          "eltype": {
            "type": "obj",
            "children": [
              {
                "name": "url",
                "props": {
                  "type": "str",
                  "title": "URL"
                }
              }, {
                "name": "description",
                "props": {
                  "type": "str",
                  "title": "\u05ea\u05d9\u05d0\u05d5\u05e8"
                }
              }
            ]
          },
          "title": "\u05e7\u05d9\u05e9\u05d5\u05e8\u05d9\u05dd"
        }
      }
    ]
  };

  $(function() {
    var J;
    $('#savedialog').modal();
    $('#savedialog').modal('hide');
    $('#updaters').modal();
    $('#updaters').modal('hide');
    J = new JSE($("#body"), update_scheme);
    $("#submit").click(function() {
      var newval;
      newval = J.getvalue();
      try {
        J.setvalue(newval);
        $("#errors").html("&nbsp;");
        $("#saver input[name='data']").val(JSON.stringify(newval));
        $("#saver").submit();
      } catch (e) {
        $("#errors").html(e);
      }
      $("#body").html("");
      J.render();
      return $('#savedialog').modal('hide');
    });
    window.onhashchange = function(e) {
      var data, hash, updater, updaters, ___iced_passed_deferral, __iced_deferrals,
        _this = this;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      hash = window.location.hash;
      hash = hash.slice(1, hash.length + 1 || 9e9);
      $("#saver").attr("action", "/update/" + hash);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: 'update-issue.iced',
          funcname: 'onhashchange'
        });
        $.getJSON("/api/" + hash, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return data = arguments[0];
            };
          })(),
          lineno: 25
        })));
        __iced_deferrals._fulfill();
      })(function() {
        var _i, _len;
        updaters = data['updates'];
        updaters = Object.keys(updaters);
        $("#updaters ul").html('<li>?????????? ??????</li>');
        for (_i = 0, _len = updaters.length; _i < _len; _i++) {
          updater = updaters[_i];
          $("#updaters ul").append("<li>" + updater + "</li>");
        }
        $('#updaters li').click(function() {
          var username;
          $("#updaters").modal('hide');
          username = $(this).html();
          J.setvalue(data['updates'][username][0]);
          $("#body").html("");
          return J.render();
        });
        return $("#updaters").modal('show');
      });
    };
    return window.onhashchange();
  });

}