function enableGestureEvents(ele) {
    var gestureEventProperties = ["screenX", "screenY", "clientX", "clientY", "pageX", "pageY"];
    ele.addEventListener("touchstart", onGestureStart, false);
    
    //gestures on this element
    var myGestures = {};

    function onGestureStart(e) {
        if (Object.getOwnPropertyNames(myGestures).length == 0) {
            document.body.addEventListener("touchend", onGestureEnd, false);
            document.body.addEventListener("touchmove", onGesture, false);
        }
        for (var i = 0; i < e.changedTouches.length; i++) {
            void function (touch) {
                var touchRecord = new Object();
                for (var p in touch)
                    touchRecord[p] = touch[p];
                var gesture = {
                    startTouch: touchRecord,
                    startTime: Date.now(),
                    status: "tapping",
                    pressingHandler: setTimeout(function () {
                        if (gesture.status == "tapping") {
                            gesture.status = "pressing";
                            var ev = document.createEvent('HTMLEvents');
                            ev.initEvent('press', true, true);
                            gestureEventProperties.forEach(function (p) {
                                ev[p] = touchRecord[p];
                            })
                            ele.dispatchEvent(ev);
                        }

                        gesture.pressingHandler = null;
                    }, 500)
                };
                myGestures[touch.identifier] = gesture;
            } (e.changedTouches[i]);
        }
        if (Object.getOwnPropertyNames(myGestures).length == 2) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('dualtouchstart', true, true);
            ele.dispatchEvent(ev);
            ev.touches = JSON.parse(JSON.stringify(e.touches));
        }
    }

    function onGesture(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            void function (touch) {
                var gesture = myGestures[touch.identifier];
                if (!gesture)
                    return;

                var displacementX = touch.clientX - gesture.startTouch.clientX;
                var displacementY = touch.clientY - gesture.startTouch.clientY;
                var distance = Math.sqrt(Math.pow(displacementX, 2) + Math.pow(displacementY, 2));
                // magic number 10: moving 10px means pan, not tap
                if (gesture.status == "tapping" && distance > 10) {
                    gesture.status = "panning";
                    var ev = document.createEvent('HTMLEvents');
                    ev.initEvent('panstart', true, true);
                    gestureEventProperties.forEach(function (p) {
                        ev[p] = touch[p];
                    });
                    ele.dispatchEvent(ev);
                }
                if (gesture.status == "panning") {
                    var ev = document.createEvent('HTMLEvents');
                    ev.initEvent('pan', true, true);
                    gestureEventProperties.forEach(function (p) {
                        ev[p] = touch[p];
                    });
                    ev.displacementX = displacementX;
                    ev.displacementY = displacementY;
                    ele.dispatchEvent(ev);
                }

            } (e.changedTouches[i]);
        }
        if (Object.getOwnPropertyNames(myGestures).length == 2) {
            var position = [];
            var current = [];
            for (var i = 0; i < e.touches.length; i++) {
                var touch = e.touches[i];
                if (myGestures[touch.identifier]) {
                    position.push([myGestures[touch.identifier].startTouch.clientX, myGestures[touch.identifier].startTouch.clientY]);
                    current.push([touch.clientX, touch.clientY]);
                }
            }


            with (Math) {
                var transform = function calc(x1, y1, x2, y2, x3, y3, x4, y4) {
                    var rotate = atan2(y4 - y3, x4 - x3) - atan2(y2 - y1, x2 - x1);
                    var scale = sqrt((pow(y4 - y3, 2) + pow(x4 - x3, 2)) / (pow(y2 - y1, 2) + pow(x2 - x1, 2)));
                    var translate = [x3 - scale * x1 * cos(rotate) + scale * y1 * sin(rotate), y3 - scale * y1 * cos(rotate) - scale * x1 * sin(rotate)];

                    return {
                        rotate: rotate,
                        scale: scale,
                        translate: translate,
                        matrix: [
                                [scale * cos(rotate), -scale * sin(rotate), translate[0]],
                                [scale * sin(rotate), scale * cos(rotate), translate[1]],
                                [0, 0, 1]
                            ]
                    }

                } (position[0][0], position[0][1], position[1][0], position[1][1], current[0][0], current[0][1], current[1][0], current[1][1]);
            }
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('dualtouch', true, true);
            ev.rotate = transform.rotate;
            ev.scale = transform.scale;
            ev.translate = transform.translate;
            ev.matrix = transform.matrix;
            ev.touches = JSON.parse(JSON.stringify(e.touches));
            ele.dispatchEvent(ev);
        }
    }

    function onGestureEnd(e) {
        if (Object.getOwnPropertyNames(myGestures).length == 2) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('dualtouchend', true, true);
            ev.touches = JSON.parse(JSON.stringify(e.touches));
            ele.dispatchEvent(ev);
        }
        for (var i = 0; i < e.changedTouches.length; i++) {
            var gesture = myGestures[e.changedTouches[i].identifier];
            var touch = e.changedTouches[i];
            if (!gesture)
                continue;

            if (gesture.pressingHandler) {
                clearTimeout(gesture.pressingHandler);
                gesture.pressingHandler = null;
            }
            if (gesture.status == "tapping") {
                var ev = document.createEvent('HTMLEvents');
                ev.initEvent('tap', true, true);
                gestureEventProperties.forEach(function (p) {
                    ev[p] = touch[p];
                });
                ele.dispatchEvent(ev);
            }
            if (gesture.status == "panning") {
                var ev = document.createEvent('HTMLEvents');
                ev.initEvent('panend', true, true);
                gestureEventProperties.forEach(function (p) {
                    ev[p] = touch[p];
                });
                ele.dispatchEvent(ev);
                
                var duration = Date.now() - gesture.startTime;
                
                if (duration < 300) {
                    var ev = document.createEvent('HTMLEvents');
                    ev.initEvent('flick', true, true);
                    
                    ev.duration = duration;
                    ev.valocityX = (touch.clientX - gesture.startTouch.clientX )/duration;
                    ev.valocityY = (touch.clientY - gesture.startTouch.clientY )/duration;
                    ev.displacementX = touch.clientX - gesture.startTouch.clientX;
                    ev.displacementY = touch.clientY - gesture.startTouch.clientY;
                    
                    gestureEventProperties.forEach(function (p) {
                        ev[p] = touch[p];
                    });
                    ele.dispatchEvent(ev);
                }
            }
            if (gesture.status == "pressing") {
                var ev = document.createEvent('HTMLEvents');
                ev.initEvent('pressend', true, true);
                gestureEventProperties.forEach(function (p) {
                    ev[p] = touch[p];
                });
                ele.dispatchEvent(ev);
            }
            delete myGestures[e.changedTouches[i].identifier];
        }
        if (Object.getOwnPropertyNames(myGestures).length == 0) {
            document.body.removeEventListener("touchend", onGestureEnd, false);
            document.body.removeEventListener("touchmove", onGesture, false);
        }
    }

    //double tap
    var lastTapTime = NaN;

    ele.addEventListener("tap", function (e) {
        if (Date.now() - lastTapTime < 500) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('doubletap', true, true);

            gestureEventProperties.forEach(function (p) {
                ev[p] = e[p];
            });
            ele.dispatchEvent(ev);
        }
        lastTapTime = Date.now();
    }, false);
}