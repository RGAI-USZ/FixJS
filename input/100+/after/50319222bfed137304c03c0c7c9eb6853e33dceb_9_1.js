function () {
    var d = document;
    var c = {
        menuType:'canvas', //whether to use canvas mode menu or dom menu
        COCOS2D_DEBUG:2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d:true,
        showFPS:true,
        frameRate:60,
        tag:'gameCanvas', //the dom element to run cocos2d on
        engineDir:'../cocos2d/',
        appFiles:[//'src/AppDelegate.js',
            'src/testbasic.js',
            'src/testResource.js',
            'src/tests/TouchesTest/Ball.js',
            'src/tests/TouchesTest/Paddle.js',
            'src/tests/TouchesTest/TouchesTest.js',
            'src/tests/SchedulerTest/SchedulerTest.js',
            'src/tests/ClickAndMoveTest/ClickAndMoveTest.js',
            'src/tests/MenuTest/MenuTest.js',
            'src/tests/ActionsTest/ActionsTest.js',
            'src/tests/TileMapTest/TileMapTest.js',
            'src/tests/TransitionsTest/TransitionsTest.js',
            'src/tests/DrawPrimitivesTest/DrawPrimitivesTest.js',
            'src/tests/ParticleTest/ParticleTest.js',
            'src/tests/ProgressActionsTest/ProgressActionsTest.js',
            'src/tests/LayerTest/LayerTest.js',
            'src/tests/SceneTest/SceneTest.js',
            'src/tests/TextureCacheTest/TextureCacheTest.js',
            'src/tests/SpriteTest/SpriteTest.js',
            'src/tests/CocosDenshionTest/CocosDenshionTest.js',
            'src/tests/CocosNodeTest/CocosNodeTest.js',
            'src/tests/RotateWorldTest/RotateWorldTest.js',
            'src/tests/IntervelTest/IntervelTest.js',
            'src/tests/ActionManagerTest/ActionManagerTest.js',
            'src/tests/EaseActionsTest/EaseActionsTest.js',
            'src/tests/ParallaxTest/ParallaxTest.js',
            'src/tests/DirectorTest/DirectorTest.js',
            'src/tests/PerformanceTest/PerformanceTest.js',
            'src/tests/PerformanceTest/PerformanceSpriteTest.js',
            'src/tests/PerformanceTest/PerformanceParticleTest.js',
            'src/tests/PerformanceTest/PerformanceNodeChildrenTest.js',
            'src/tests/PerformanceTest/PerformanceTextureTest.js',
            'src/tests/FontTest/FontTest.js',
            'src/tests/PerformanceTest/PerformanceTouchesTest.js',
            'src/tests/LabelTest/LabelTest.js',
            'src/tests/CurrentLanguageTest/CurrentLanguageTest.js',
            'src/tests/TextInputTest/TextInputTest.js',
            'src/tests/Box2dTest/Box2dTest.js']
    };
    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        s.src = c.engineDir + 'platform/jsloader.js';
        d.body.appendChild(s);
        s.c = c;
        s.id = 'cocos2d-html5';
        //else if single file specified, load singlefile
    });
}