function(url, callback){
  var commandOptionsPost = {
    path: "/session/:sessionId/url",
    method: "POST"
  }
  var commandOptionsGet = {
    path: "/session/:sessionId/url",
    method: "GET"
  }
  var self = this;
  var data;

  // set
  if (typeof url === "string"){
    data = {"url": url};
    this.executeProtocolCommand(
      commandOptionsPost,
      self.proxyResponse(callback), 
      data
    );
  }else {
    // get
    callback = url;
    data = {};
    this.executeProtocolCommand(
      commandOptionsGet, 
      self.proxyResponse(callback), 
      data
    );
  }
}