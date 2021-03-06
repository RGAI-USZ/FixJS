function()

{

  var ev_listener_toolbar_config =

  {

    view: "ev-listeners-all",

    groups:

    [

      {

        type: UI.TYPE_BUTTONS,

        items:

        [

          {

            handler: "update-ev-listeners",

            title: ui_strings.S_BUTTON_LABEL_REFETCH_EVENT_LISTENERS,

          },

        ]

      },

      {

        type: UI.TYPE_INPUT,

        items:

        [

          {

            handler: cls.EventListenersView.TOKEN_FILTER,

            shortcuts: cls.EventListenersView.TOKEN_FILTER,

            title: ui_strings.S_SEARCH_INPUT_TOOLTIP,

            label: ui_strings.S_INPUT_DEFAULT_TEXT_FILTER,

            type: "filter"

          },

        ]

      }

    ]

  };



  new ToolbarConfig(ev_listener_toolbar_config);

}