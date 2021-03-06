function resolver (url, mimeType, callback) {
    var resolved = path.resolve(base, url)
    switch (mimeType) {
    case "text/javascript":
      try {
        callback(null, require(resolved));
      } catch (error) {
        callback(error);
      }
      break;
    case "text/xml":
      callback(null, new (xmldom.DOMParser)().parseFromString(fs.readFileSync(resolved, "utf8")));
      /*fs.readFile(resolved, "utf8", function (error, source) {
        if (error) callback(error);
        else callback(null, new (xmldom.DOMParser)().parseFromString(source));
      });*/
      break;
    }
  }