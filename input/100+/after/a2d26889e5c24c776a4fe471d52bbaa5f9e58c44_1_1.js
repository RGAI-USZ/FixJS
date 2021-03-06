function(
    Backbone, 
    Comment, 
    Comments,
    Confidential, 
    DataLists,
    DatumField,
    DatumFields, 
    DatumState,
    DatumStates,
    DataLists,
    Consultants,
    Permissions,
    Sessions,
    User
) {
  var Corpus = Backbone.Model.extend(
    /** @lends Corpus.prototype */
    {
      /**
       * @class A corpus is like a git repository, it has a remote, a title
       *        a description and perhaps a readme When the user hits sync
       *        their "branch" of the corpus will be pushed to the central
       *        remote, and we will show them a "diff" of what has
       *        changed.
       * 
       * The Corpus may or may not be a git repository, so this class is
       * to abstract the functions we would expect the corpus to have,
       * regardless of how it is really stored on the disk.
       * 
       * 
       * @property {String} title This is used to refer to the corpus, and
       *           what appears in the url on the main website eg
       *           http://fieldlinguist.com/Sapir/SampleFieldLinguisticsCorpus
       * @property {String} description This is a short description that
       *           appears on the corpus details page
       * @property {String} remote The git url of the remote eg:
       *           git@fieldlinguist.com:Sapir/SampleFieldLinguisticsCorpus.git
       *           
       * @property {Consultants} consultants Collection of consultants who contributed to the corpus
       * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus 
       * @property {DatumFields} datumfields Collection of datum fields used in the corpus
       * @property {Sessions} sessions Collection of sessions that belong to the corpus
       * @property {DataLists} datalists Collection of data lists created under the corpus
       * @property {Permissions} permissions Collection of permissions groups associated to the corpus 
       * 
       *           
       * @property {Glosser} glosser The glosser listens to
       *           orthography/utterence lines and attempts to guess the
       *           gloss.
       * @property {Lexicon} lexicon The lexicon is a list of morphemes,
       *           allomorphs and glosses which are used to index datum, and
       *           also to gloss datum.
       * 
       * @description The initialize function probably checks to see if
       *              the corpus is new or existing and brings it down to
       *              the user's client.
       * 
       * @extends Backbone.Model
       * @constructs
       */
      initialize : function() {
        // http://www.joezimjs.com/javascript/introduction-to-backbone-js-part-5-ajax-video-tutorial/
        this.on('all', function(e) {
          Utils.debug(this.get('title') + " event: " + JSON.stringify(e));
        }); 

        if(typeof(this.get("datumStates")) == "function"){
          this.set("datumStates", new DatumStates([ 
            new DatumState()
            ,new DatumState({
              state : "To be checked",
              color : "warning"
            })
            , new DatumState({
              state : "Deleted",
              color : "important"
            }) 
          ]));
        }//end if to set datumStates
        
        if(typeof(this.get("datumFields")) == "function"){
          this.set("datumFields", new DatumFields([ 
            new DatumField({
              label : "judgement",
              size : "3",
              encrypted: "",
              userchooseable: "disabled",
              help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)"
            }),
            new DatumField({
              label : "utterance",
              encrypted: "checked",
              userchooseable: "disabled",
              help: "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
            }),
            new DatumField({
              label : "morphemes",
              encrypted: "checked",
              userchooseable: "disabled",
              help: "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation."
            }),
            new DatumField({
              label : "gloss",
              encrypted: "checked",
              userchooseable: "disabled",
              help: "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. "
            }),
            new DatumField({
              label : "translation",
              encrypted: "checked",
              userchooseable: "disabled",
              help: "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. "
            })
          ]));
        }//end if to set datumFields
        
        if(typeof(this.get("sessionFields")) == "function"){
          this.set("sessionFields", new DatumFields([ 
            new DatumField({
              label : "user",
              encrypted: "",
              userchooseable: "disabled"
            }),
            new DatumField({
              label : "consultants",
              encrypted: "",
              userchooseable: "disabled"
            }),
            new DatumField({
              label : "language",
              encrypted: "",
              userchooseable: "disabled",
              help: "This is the langauge (or language family) if you would like to use it."
            }),
            new DatumField({
              label : "dialect",
              encrypted: "",
              userchooseable: "disabled",
              help: "You can use this field to be as precise as you would like about the dialect of this session."
            }),
            new DatumField({
              label : "dateElicited",
              encrypted: "",
              userchooseable: "disabled",
              help: "This is the date in which the session took place."
            }),
            new DatumField({
              label : "dateSEntered",
              encrypted: "",
              userchooseable: "disabled",
              help: "This is the date in which the session was entered."
            }),
            new DatumField({
              label : "goal",
              encrypted: "",
              userchooseable: "disabled",
              help: "This describes the goals of the session."
            }),  
          ]));
          
        }//end if to set sessionFields
        
        
        if(typeof(this.get("comments")) == "function"){
          this.set("comments", new Comments([ 
            new Comment()
            ]));
        }
        
        if(typeof(this.get("dataLists")) == "function"){
          this.set("dataLists", new Comments([ 
            new DataLists()
            ]));
        }
//        if(typeof(this.get("searchFields")) == "function"){
//          this.set("searchFields", 
//              this.get("datumFields"));
//          this.set("searchFields",
//              this.get("sessionFields"));
//            new DatumFields([ 
            //TODO add the session fields here too, instead of just the datumFields
//          ]));
   //     }//end if to set sessionFields
      },
      
      defaults : {
        title : "Untitled Corpus",
        titleAsUrl :"UntitledCorpus",
        description : "This is an untitled corpus, created by default.",
        confidential :  Confidential,
        consultants : Consultants,
        datumStates : DatumStates,
        datumFields : DatumFields, 
        sessionFields : DatumFields,
        searchFields : DatumFields,
        sessions : Sessions, 
        dataLists : DataLists, 
        permissions : Permissions,
        comments: Comments,
        couchConnection : Utils.defaultCouchConnection()
        
      },
      //this gets overridden when user calls replicate, so that it is the current corpus's database url
      pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
          : Utils.pouchUrl),
      /**
       * Synchronize the server and local databases.
       */
      replicateCorpus : function(callback) {
        var self = this;
        
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl+self.get("couchConnection").corpusname
            : Utils.pouchUrl+self.get("couchConnection").corpusname);
        
        this.pouch(function(err, db) {
          var couchurl = self.get("couchConnection").protocol+self.get("couchConnection").domain;
          if(self.get("couchConnection").port){
            couchurl = couchurl+":"+self.get("couchConnection").port;
          }
          couchurl = couchurl + self.get("couchConnection").corpusname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate to " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
          });
          db.replicate.from(couchurl, { continuous: false }, function(err, resp) {
            Utils.debug("Replicate from " + couchurl);
            Utils.debug(resp);
            Utils.debug(err);
            if(typeof callback == "function"){
              callback();
            }
          });
        });
      },
      
      validate: function(attrs){
//        console.log(attrs);
//        if(attrs.title != undefined){
//          this.set("titleAsUrl",encodeURIComponent(attrs.title)); //TODO the validate on corpus was not working.
//        }
      }

    });
    
  return Corpus;
}