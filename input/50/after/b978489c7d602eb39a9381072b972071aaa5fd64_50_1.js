function () {
        cc.Director.sharedDirector().getTouchDispatcher().addTargetedDelegate(this, 0, true);
        this._super();
    }