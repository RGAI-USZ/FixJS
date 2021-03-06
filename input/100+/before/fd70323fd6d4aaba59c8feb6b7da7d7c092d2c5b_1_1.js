function() {
		var me = this;
		Ext.apply(me, {
            border: false,
            layout: {
                type: 'border',
                align: 'stretch'
            },  
            items: [
                Ext.create('CogMon.ui.UserTabView', {itemId: 'tv1', height: '100%', tabPosition: 'bottom', region: 'center'}),
                {
                    xtype: 'coggraphlist',
                    itemId: 'navpanel',
                    collapsible: true,
                    collapsed: !Ext.isEmpty(CogMon.User.Preferences) && CogMon.User.Preferences.NavPanelCollapsed,
                    region: 'west',
                    width: 300,
                    split: true,
                    border: false,
                    title: Ext.String.format("User: {0} ({1})", CogMon.User.Name, CogMon.User.Login),
                    tbar: [
						{
							xtype: 'button', text: 'User', icon: 'Content/img/user.png',
							menu: [
								{
									text: 'Logout',
									handler: function() {
										document.location.href = 'Account/LogOff';
									}
								},
								{
									text: 'Preferences', disabled: true
								}
								/*{	
									text: 'date test',
									handler: function() {
										var w = Ext.create('Ext.Window', {
											modal: true, width: 500, height: 300, title: 'date parse',
											items: {
												xtype: 'form', itemId: 'theForm',
												items: [
													{xtype: 'textfield', name: 'd1', fieldLabel: 'start'},
													{xtype: 'textfield', name: 'd2', fieldLabel: 'end'}
												],
												buttons: [
													{
														text: 'Test', 
														handler: function() {
															var f = w.down('#theForm').getForm();
															var v = f.getValues();
															var d = AppUtil.parseDateRange(v.d1, v.d2);
															alert('d is ' + Ext.encode(d));
														}
													},
													{text: 'Close', handler: function() { w.close(); }}
												]
											}
										
										});
										w.show();
									}
								}*/
							]
						},
						
						{
							xtype: 'button', text: 'Dashboard', icon: 'Content/img/dashb.png',
							menu: [
								{   
									text: 'New page', icon: 'Content/img/add.png',
									handler: function() {
										var mp = me.getComponent('navpanel');
										CogMon.ui.NewPortalPagePanel.showNewPageWindow(function(pconfig) {
											RPC.UserGui.AddNewUserPortalPage(pconfig, {
												success: function(ret, e) {
													if (e.status)
													{
														mp.refresh();
														me.openPortalPage(ret.Id);
													}
												}
											});
										});
									}
								},
								{
									text: 'Delete page', icon: 'Content/img/delete.png',
									handler: function() {
										var mp = me.getComponent('navpanel');
										var tv = me.getComponent('tv1');
										mp.deleteSelectedPage();
									}
								},
								{
									text: 'Add event', icon: 'Content/img/addevent.png',
									handler: function() {
										CogMon.ui.MainGUIPanel.showAddEventWindow({
										});
									}
								},
								{
									text: 'Navigation',
									menu: [
										{
											text: 'Add folder',
											handler: function() { 
												var p = me.down('#navpanel');
												var sn = p.getSelectedNode();
												Ext.Msg.prompt('Create folder', 'Folder name', function(b, name) {
													var pid = null;
													if (!Ext.isEmpty(sn)) {
														alert('sth sel' + b + ' ' + sn.ntype);
														pid = sn.id;
													}
													RPC.UserGui.CreateNavigationFolder(pid, name, {
														success: function(e, ret) {
															p.refresh();
														}
													});
												});
												
											}
										},
										{
											text: 'Delete folder',
											handler: function() {
												var p = me.down('#navpanel');
												var sn = p.getSelectedNode();
												if (Ext.isEmpty(sn)) return;
												RPC.UserGui.DeleteNavigationFolder(sn.id, {
													success: function(e, ret) {
														p.refresh();
													}
												});
											}
										}
									]
								},
								{
									text: 'Graphs',
									menu: [
										{
											text: 'New RRD graph',
											handler: function() {
												Ext.require('CogMon.ui.RrdGraphEditorPanel', function() {
													CogMon.ui.RrdGraphEditorPanel['openEditorWindow']();
												});
											}
										},
										{
											text: 'Modify RRD graph',
											handler: function() {
												Ext.require(['CogMon.ui.RrdGraphListPanel', 'CogMon.ui.RrdGraphEditorPanel'], function() {
													CogMon.ui.RrdGraphListPanel.openGraphListWindow({
														itemselected: function(g, grph) {
															//console.log('item selected: ' + Ext.encode(grph));
															if (!grph.IsMine) return false;
															CogMon.ui.RrdGraphEditorPanel['openEditorWindow']({graphDefinitionId: grph.Id});
															return true;
														}
													});
												});
											}
										}
									]
								}
							]
                        }
                    ],
                    listeners: {
                        portalpageclick: function(pp, id) {
                            
                            me.openPortalPage(id);
                        },
						pagedeleted: function(pp, id) {
							var tv = me.getComponent('tv1');
							tv.removePage(id);
						},
						collapse: function(p, o) {
							console.log("collapse:");
							RPC.UserGui.UpdateUserPreferences({NavPanelCollapsed: true}, {});
						},
						expand: function(p, o) {
							console.log("expand:");
							RPC.UserGui.UpdateUserPreferences({NavPanelCollapsed: false}, {});
						}
                    }
                }
            ]
		});
		this.callParent(arguments);
	}