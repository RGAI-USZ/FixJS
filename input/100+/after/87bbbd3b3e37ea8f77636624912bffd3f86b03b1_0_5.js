function(
    Backbone,
    Handlebars,
    DataList,
    DataListEditView,
    DatumFields
) {
  var Import = Backbone.Model.extend(

  /** @lends Import.prototype */
  {
    /**
     * @class The import class helps import csv, xml and raw text data into a corpus, or create a new corpus. 
     *
     * @property {FileList} files These are the file(s) that were dragged in.
     * @property {String} corpusname This is the corpusid where the data should be imported
     * @property {DatumFields} fields The fields array contains titles of the data columns.
     * @property {DataList} datalist the datalist imported, to hold the data before it is saved.
     * @property {Event} event The drag/drop event.
     * 
     * @description The initialize serves to bind import to all drag and drop events. 
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.set("corpusname", window.app.get("corpus").get("corpusname"));
      if(this.get("datumFields") == undefined){
        this.set("datumFields",window.app.get("corpus").get("datumFields").clone());
      }
    },

    // This is an list of attributes and their default values
    defaults : {
      status : "",
      fileDetails : "",
      corpusname : "",
//      rawText: "",
//      asCSV : "", //leave undefined
//      asXML : "",
//      asDatumFields : "";
      files : [],
    },
    
    // Internal models: used by the parse function
    model : {
      dataList : DataList,
      fields : DatumFields
    },

    /**
     * Describe the validation here.
     *
     * @param {Object} attributes The set of attributes to validate.
     *
     * @returns {String} The validation error, if there is one. Otherwise, doesn't
     * return anything.
     */
    validate : function(attributes) {
    },
    
    importCSV : function(text) {
      var rows = text.split("\n");
      for(l in rows){
        rows[l] = this.parseLineCSV(rows[l]);
      }
      
      this.set("asCSV", rows);
    },
    
    
    /**
     * http://purbayubudi.wordpress.com/2008/11/09/csv-parser-using-javascript/
     * // -- CSV PARSER --
      // author  : Purbayu, 30Sep2008
      // email   : purbayubudi@gmail.com
      //
      // description :
      //  This jscript code describes how to load csv file and parse it into fields.
      //  Additionally, a function to display html table as result is added.
      //
      // disclamer:
      //  To use this code freely, you must put author's name in it.
     */
    parseLineCSV : function(lineCSV) {
      // parse csv line by line into array
      var CSV = new Array();

      // Insert space before character ",". This is to anticipate
      // 'split' in IE
      // try this:
      //
      // var a=",,,a,,b,,c,,,,d";
      // a=a.split(/\,/g);
      // document.write(a.length);
      //
      // You will see unexpected result!
      //
      lineCSV = lineCSV.replace(/,/g, " ,");

      lineCSV = lineCSV.split(/,/g);

      // This is continuing of 'split' issue in IE
      // remove all trailing space in each field
      for ( var i = 0; i < lineCSV.length; i++) {
        lineCSV[i] = lineCSV[i].replace(/\s*$/g, "");
      }

      lineCSV[lineCSV.length - 1] = lineCSV[lineCSV.length - 1]
      .replace(/^\s*|\s*$/g, "");
      var fstart = -1;

      for ( var i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i].match(/"$/)) {
          if (fstart >= 0) {
            for ( var j = fstart + 1; j <= i; j++) {
              lineCSV[fstart] = lineCSV[fstart] + "," + lineCSV[j];
              lineCSV[j] = "-DELETED-";
            }
            fstart = -1;
          }
        }
        fstart = (lineCSV[i].match(/^"/)) ? i : fstart;
      }

      var j = 0;

      for ( var i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i] != "-DELETED-") {
          CSV[j] = lineCSV[i];
          CSV[j] = CSV[j].replace(/^\s*|\s*$/g, ""); // remove leading & trailing
          // space
          CSV[j] = CSV[j].replace(/^"|"$/g, ""); // remove " on the beginning
          // and end
          CSV[j] = CSV[j].replace(/""/g, '"'); // replace "" with "
          j++;
        }
      }

      return CSV;
    },
    importXML : function(xml) {
    },
    
    importText : function() {
    },
    readFiles : function(){
      var filedetails = [];
      var files = this.get("files");
      Utils.debug(files);
      for ( var i = 0, f; f = files[i]; i++) {
        filedetails.push( escape(f.name), f.type
            || 'n/a', ' - ', f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
                : 'n/a');
        
        this.readFileIntoRawText(i, function(){
          Utils.debug("Finished reading in the raw text file.")
        });
//        this.set("asCSV", this.importCSV(f.getBytes()));
//      this.set("asXML", this.importCSV(f.getBytes()));

      }
      
      var status = this.get("status");
      this.set("fileDetails", filedetails.join('') );
      status = status + filedetails.join('');
      this.set("status", status);
      if (this.get("datalist") == undefined) {
        this.set("datalist",new DataList(
          {
            title : "Data from "+files[0].name,
            description : "This is the data list which would result from the import of these files."
              + this.get("fileDetails"),
            corpusname: this.get("corpusname")
          }));
      }
      this.dataListView = new DataListEditView({model : this.get("datalist")});
      this.dataListView.format = "import";
      this.dataListView.render();
      
      
    },
    readFileIntoRawText : function(index, callback){
      var self = this;
       this.readBlob(this.get("files")[index], function(){
         if(self.get("files")[index].name.split('.').pop() == "csv"){
           self.importCSV(self.get("rawText"), callback);
         }else if(self.get("files")[index].name.split('.').pop() == "eaf"){
           self.importXML(self.get("rawText"), callback);
         }
       });
     
    },
    readBlob : function (file, callback, opt_startByte, opt_stopByte) {
      //console.log(this);
      var start = parseInt(opt_startByte) || 0;
      var stop = parseInt(opt_stopByte) || file.size - 1;
      var reader = new FileReader();

      var self = this;
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          self.set("rawText", evt.target.result);
          if(typeof callback == "function"){
            callback();
          }
        }
      };
      var blob = '';
      if (file.webkitSlice) {
        blob = file.webkitSlice(start, stop + 1);
      } else if (file.mozSlice) {
        blob = file.mozSlice(start, stop + 1);
      }
      reader.readAsBinaryString(blob);
//      reader.readAsText(file);
    }
  });
   
  return Import;
}