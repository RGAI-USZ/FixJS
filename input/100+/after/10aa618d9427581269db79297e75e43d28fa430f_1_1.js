function () {
        this.items = {
            dockedItems: [{
                xtype: 'toolbar',
                height: 40,
                dock: 'top',
                items: [{
                    xtype: 'image',
                    height: 35,
                    width: 40,
                    src: '../resources/img/icon.png'
                }, {
                    xtype: 'tbfill'
                }, {
                    xtype: 'tbtext',
                    text: 'You are logged in as '+ username
                }, {
                    xtype: 'tbseparator'
                }, {
                    xtype: 'button',
                    width: 60,
                    text: 'Sign Out',                    
                }]
            }, {
                dock: 'bottom',
                xtype: 'toolbar',
                height: 40,
                items: [{
                    xtype: 'tbspacer',
                    width: 380
                }, {
                    xtype: 'image',
                    height: 35,
                    width: 40,
                    src: '../resources/img/icon.png'
                }]
            }],
            width: 800,
            id: 'mainregarea',
            activeItem: 0,
            layout: {
                type: 'card'
            },
            margin: '2 0 2 0',
            region: 'center',
            items: [{
                xtype: 'home'
            }, {
                xtype: 'registrationpart1'
            }, {
                xtype: 'registrationpart2'
            }, {
                xtype: 'confirmationScreen'
            }, {
            xtype: 'searchpart1'
            }, { 
            xtype: 'searchpart2'
            }, {
            xtype: 'searchPatientScreen'
            }]
        };
        this.callParent();
    }