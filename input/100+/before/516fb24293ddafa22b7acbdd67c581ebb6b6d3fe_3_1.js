function(){
        if(this[0] && this[0].parentNode){
            baidu.dom._smartInsert(this, arguments, function(node){
                this.parentNode.insertBefore(node, this);
            });
        }else if(arguments.length){
            var set = baidu.merge(baidu.dom._buildElements(arguments, this.getDocument() || document), this);
            this.length = 0;
            baidu.merge(this, set);
        }
        return this;
    }