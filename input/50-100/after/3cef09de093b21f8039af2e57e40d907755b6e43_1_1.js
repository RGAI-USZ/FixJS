function resolver (url, mimeType, callback) {
    switch (mimeType) {
    case "text/javascript":
      try {
        callback(null, require(url));
      } catch (error) {
        callback(error);
      }
      break;
    case "text/xml":
      callback(null, new (xmldom.DOMParser)().parseFromString(fs.readFileSync(url, "utf8")));
      /*fs.readFile(url, "utf8", function (error, source) {
        if (error) callback(error);
        else callback(null, new (xmldom.DOMParser)().parseFromString(source));
      });*/
      break;
    }
  }