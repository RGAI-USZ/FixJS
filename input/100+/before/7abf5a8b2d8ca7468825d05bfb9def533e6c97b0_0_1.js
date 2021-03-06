function()
{
  const
  TRANSPORT_STRING = 1,
  TRANSPORT_DATA_URI = 3,
  DECODE_TRUE = 1,
  SIZE_LIMIT = 1e7,
  TRANSPORT_OFF = 4;

  this._show_resource = function()
  {
    if (!this._manager.get_resource_for_url(this._url))
    //if (!this._view.show_resource_for_url(this._url, this._data))
    {
      if (this._service.requestGetResourceID)
      {
        var tag = this._tagman.set_callback(this, this._on_resolve_url);
        this._service.requestGetResourceID(tag, [this._url]);
      }
      else
      {
        this._fallback();
      }
    }
  };

  this._on_resolve_url = function(status, message)
  {
    if (status)
    {
      if (this._service.requestCreateRequest)
      {
        var debugContext = window.window_manager_data.get_debug_context();
        var tag = this._tagman.set_callback(this, this._on_resolve_url_request);
        this._service.requestCreateRequest(tag, [debugContext, this._url, 'GET']);
      }
      else
      {
        this._fallback();
      }
    }
    else
    {
      const RESOURCE_ID = 0;
      this._rid = message[RESOURCE_ID];
//      if (!this._view.show_resource_for_id(this._rid))
      {
        var tag = this._tagman.set_callback(this, this._on_mime_type);
        this._service.requestGetResource(tag, [this._rid, [TRANSPORT_OFF]]);
      }
    }
  };

  this._on_resolve_url_request = function(status, message)
  {
    if (status)
    {
      this._fallback();
    }
    else
    {
      const RESOURCE_ID = 0;
      this._rid = message[RESOURCE_ID];
//      if (!this._view.show_resource_for_id(this._rid))
      {
        var tag = this._tagman.set_callback(this, this._on_mime_type);
        this._service.requestGetResource(tag, [this._rid, [TRANSPORT_OFF]]);
      }
    }
  };

  this._on_mime_type = function(status, message)
  {
    if (status)
    {
      this._fallback();
    }
    else
    {
      this._res = new cls.Resource(this._rid);
      this._res.update("urlfinished", new this._ResourceData(message));
      var resptype = this._utils.mime_to_content_mode(this._res.mime);
      var tag = this._tagman.set_callback(this, this._on_resource);
      var msg = 
      [
        this._rid, 
        [
          resptype == "datauri" ? TRANSPORT_DATA_URI : TRANSPORT_STRING,
          DECODE_TRUE,
          SIZE_LIMIT
        ]
      ];
      this._service.requestGetResource(tag, msg);
    }
  };
.001

  this._on_resource = function(status, message)
  {
    if (status)
    {
      this._fallback();
    }
    else
    {
      //this._res.update("urlfinished", new this._ResourceData(message));
      this._res.update("responsefinished", message );
      this._view.open_resource_tab(this._res, this._data);
      window.UI.instance.show_view( this._view.id );
    }
  };

  this._fallback = function()
  {
    window.open(this._url);
  };

  this._init_prototype = function()
  {
    this._tagman = window.tagManager;
    this._service = window.services['resource-manager'];
    this._ResourceData = cls.ResourceManager["1.0"].ResourceData;
    this._utils = cls.ResourceUtil;
  }.bind(this);

}