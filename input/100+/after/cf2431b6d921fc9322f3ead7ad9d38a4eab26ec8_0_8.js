function(a){this._manipulator=a},getLight:function(){return this._light},setLight:function(a){this._light=a;this._lightingMode!==osgViewer.View.LightingMode.NO_LIGHT&&this._scene.getOrCreateStateSet().setAttributeAndMode(this._light)},getLightingMode:function(){return this._lightingMode},setLightingMode:function(a){if(this._lightingMode!==a)if(this._lightingMode=a,this._lightingMode!==osgViewer.View.LightingMode.NO_LIGHT){if(!this._light)this._light=new osg.Light,this._light.setAmbient([0.2,
0.2,0.2,1]),this._light.setDiffuse([0.8,0.8,0.8,1]),this._light.setSpecular([0.5,0.5,0.5,1])}else this._light=void 0}