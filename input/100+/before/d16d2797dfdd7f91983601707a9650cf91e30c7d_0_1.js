function(uri_prop_name)

{

  /*

    interface



    hash

    host

    pathname // for data: URIs, this is everything after "data:"

    protocol

    search

    filename

    dir_pathname // pathname minus filename

    abs_dir // protocol plus hostname plus dir_pathname

    path_parts // list of "directories" in pathname

    short_distinguisher // the last part of a url that can be used to distinguish it

  */



  [

    "hash",

    "host",

    "pathname",

    "protocol",

    "search",

    "path_parts"

  ].forEach(function(prop)

  {

    this.__defineGetter__(prop, function()

    {

      if (!this._is_parsed)

        this._init();



      return this["_" + prop];

    });

    this.__defineSetter__(prop, function() {});

  }, this);



  this.__defineGetter__("filename", function()

  {

    if (this._filename === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      if (!this._is_data_uri)

      {

        var pos = this.pathname.lastIndexOf("/");

        if (pos > -1)

          this._filename = this.pathname.slice(pos + 1);

        else

          this._filename = this.pathname;

      }

      else

        this._filename = "";

    }



    return this._filename;

  });



  this.__defineSetter__("filename", function() {});



  this.__defineGetter__("extension", function()

  {

    if (this._extension === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      if (!this._is_data_uri)

      {

        var pos = this.filename.lastIndexOf(".");

        if (pos > -1)

          this._extension = this.filename.slice(pos + 1);

        else

          this._extension = "";

      }

      else

        this._extension = "";

    }



    return this._extension;

  });



  this.__defineSetter__("extension", function() {});



  this.__defineGetter__("dir_pathname", function()

  {

    if (this._dir_pathname === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      if (!this._is_data_uri)

      {

        var pos = this.pathname.lastIndexOf("/");

        if (pos > -1)

          this._dir_pathname = this.pathname.slice(0, pos + 1);

        else

          this._dir_pathname = "";

      }

      else

        this._dir_pathname = "";

    }



    return this._dir_pathname;

  });



  this.__defineSetter__("dir_pathname", function() {});



  this.__defineGetter__("abs_dir", function()

  {

    if (this._abs_dir === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      if (!this._is_data_uri)

      {

        this._abs_dir = (this.protocol ? this.protocol + "//" : "") +

                        this.host + this.dir_pathname;

      }

      else

        this._abs_dir = "";

    }



    return this._abs_dir;

  });



  this.__defineSetter__("abs_dir", function() {});



  this.__defineGetter__("origin", function()

  {

    if (this._origin === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      if (!this._is_data_uri)

        this._origin = this.protocol + "//" + this.host;

      else

        this._origin = "";

    }



    return this._origin;

  });



  this.__defineSetter__("origin", function() {});



  this.__defineGetter__("params", function()

  {

    if (this._params === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      this._params = [];

      if (!this._is_data_uri && this._search[0] === "?")

      {

        var pairs = this._search.slice(1).split("&");

        pairs.forEach(function(pair) {

          var first_eq = pair.indexOf("=");

          if (first_eq === -1) { first_eq = pair.length; }

          var key = pair.slice(0, first_eq);

          if (key)

          {

            var value = pair.slice(first_eq + 1);

            this._params.push({"key": decodeURIComponent(key),

                               "value": decodeURIComponent(value)});

          }

        }, this);

      }

    }

    return this._params;

  });



  this.__defineSetter__("short_distinguisher", function() {});



  this.__defineGetter__("short_distinguisher", function()

  {

    if (this._short_distinguisher === undefined && (this._is_parsed || this[uri_prop_name]))

    {

      // When pathname ends with "/", and there is search or hash,

      // the short_distinguisher is just search + hash

      var search_and_hash = this.search + this.hash;

      if (search_and_hash &&

          this.pathname.lastIndexOf("/") === this.pathname.length - 1)

      {

        this._short_distinguisher = search_and_hash;

      }

      else if (this.path_parts.length)

      {

        var parts = this.path_parts;

        this._short_distinguisher = parts[parts.length - 1] + search_and_hash;

      }

      else if (this._is_data_uri)

      {

        this._short_distinguisher = this._protocol + this._pathname + this._hash;

      }

      else

        this._short_distinguisher = this.host;

    }

    return this._short_distinguisher;

  });



  this._init = function(uri)

  {

    if (!uri && this[uri_prop_name])

      uri = this[uri_prop_name];



    if (uri)

    {

      this._is_data_uri = uri.indexOf("data:") === 0;

      var val = uri;



      var pos = val.indexOf("#");

      if (pos > -1)

      {

        this._hash = val.slice(pos);

        val = val.slice(0, pos);

      }

      else

        this._hash = "";



      pos = val.indexOf("?");

      if (pos > -1 && !this._is_data_uri)

      {

        this._search = val.slice(pos);

        val = val.slice(0, pos);

      }

      else

        this._search = "";



      pos = val.indexOf(":");

      if (pos > -1)

      {

        this._protocol = val.slice(0, pos + 1);

        val = val.slice(pos + 1);

        while (val.indexOf("/") === 0)

          val = val.slice(1);

      }

      else

        this._protocol = "";



      pos = val.indexOf("/");

      if (pos > -1 && !this._is_data_uri)

      {

        this._host = val.slice(0, pos);

        val = val.slice(pos);

      }

      else if (this._protocol && !this._is_data_uri)

      {

        this._host = val;

      }

      else

        this._host = "";



      // pathname for a data: URI is everything after "data:" for consistency with

      // some browsers

      if (val)

        this._pathname = val;

      else

        this._pathname = "";



      if (this._pathname && !this._is_data_uri)

        this._path_parts = this._pathname.split("/").filter(Boolean);

      else

        this._path_parts = [];

    }



    this._is_parsed = true;

  };



}