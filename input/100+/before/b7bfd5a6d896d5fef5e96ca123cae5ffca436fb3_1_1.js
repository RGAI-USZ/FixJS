function(){
        window.plugins.nativeUI.setTitle({title: "Белый дом", organize: false, refresh: false, menu: true});

        $(document).bind(iLepra.events.ready, function(event){
            $(document).unbind(event);

            // hide loading msg
            $.mobile.hidePageLoadingMsg()

            // render posts
            $("#president").html(
                "<a href='#' class='username'>"+iLepra.gov.president + "</a> - " + iLepra.gov.time
            );
        });
        iLepra.gov.getCurrent();
    }