function(){
      //Create a CommentEditView     
      this.commentEditView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentEditView,
        childViewTagName     : 'li'
      });
      
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.get("permissions"),
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
      
    }