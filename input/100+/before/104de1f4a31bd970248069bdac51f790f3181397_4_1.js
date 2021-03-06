function readDir(
  polpetta,
  response,
  dirName,
  err,
  files
) {
  var output = this;
  if (err) {
    internalServerError(
      output,
      polpetta,
      response
    );
  } else {
    dirName = dirName.replace(polpetta.root, "") + "/";
    output.push(
      "<!doctype html>",
      "<html>",
        "<head>",
          "<title>", dirName, "</title>",
          '<meta name="viewport" content="',
            'width=device-width,',
            'initial-scale=1.0,',
            'maximum-scale=1.0,',
            'user-scalable=no',
          '"/>',
          '<meta name="generator" content="polpetta" />',
        "</head>",
        "<body>",
          "<strong>Files found in " + dirName + "</strong>",
          "<ul>"
    );
    if (dirName != "/") {
      output.push(
        '<li><a href="' + dirName + '..">..</a></li>'
      );
    }
    output.dirName = dirName;
    files.forEach(readDir.forEach, output);
    output.push(
          "</ul>",
        "</body>",
      "</html>"
    );
    response.writeHead(
      200,
      polpetta.header("html")
    );
    response.end(
      output.join(""),
      "utf-8"
    );
  }
}