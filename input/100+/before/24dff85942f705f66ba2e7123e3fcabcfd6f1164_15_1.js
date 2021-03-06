function metadataParser(file, callback, errback) {
    // Meta-data parsing of mp3 and ogg files
    // On B2G devices, file.type of mp3 format is missing
    // use file extension instead of file.type
    var extension = file.name.slice(-4);
    var metadata = {};

    if (extension === '.mp3') {

      ID3.loadTags(file.name, function() {
        var tags = ID3.getAllTags(file.name);

        metadata.album = tags.album;
        metadata.artist = tags.artist;
        metadata.title = tags.title;

        callback(metadata);
      }, {
        dataReader: FileAPIReader(file)
      });

    } else if (extension === '.ogg') {
      var oggfile = new OggFile(file, function() {

        metadata.album = oggfile.metadata.ALBUM;
        metadata.artist = oggfile.metadata.ARTIST;
        metadata.title = oggfile.metadata.TITLE;

        callback(metadata);
      });
      oggfile.parse();
    } else {
      console.log('Not supported audio file');
    }
  }