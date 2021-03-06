function (position) {
            if (myMarker) map.removeLayer(myMarker);
            myMarker = new L.Marker(new L.LatLng(position.coords.latitude, position.coords.longitude))
            var CustomIcon = L.Icon.extend({
                iconUrl:'home.png',
                iconSize:new L.Point(32, 38),
                iconAnchor:new L.Point(16, 38),
                popupAnchor:new L.Point(16, -48)
            });
            myMarker.setIcon(new CustomIcon('home.png'), {draggable: true});
            map.addLayer(myMarker);
            if (tagetLocation && new Date().getTime() - lastRouteRequest > 60000) {

                $.getJSON('http://open.mapquestapi.com/directions/v0/route?callback=?', {
                    outFormat:'json',
                    routeType:'shortest', // make options for this
                    timeType:1, // options
                    enhancedNarrative:true,
                    narrativeType:'microformat',
                    shapeFormat:'raw',
                    generalize:200,
                    locale:'en_GB',
                    unit:'m',
                    from:[position.coords.latitude, position.coords.longitude].join(','),
                    to:[tagetLocation.lat, tagetLocation.lng].join(','),
                    drivingStyle:2, // not sure if options
                    highwayEfficiency:21.0 // also not sure if options
                }, function (response) {
                    console.log(response);
                    $("#directionsPanel").html("");
                    $("<table />").appendTo("#directionsPanel");
                    response.route.legs[0].maneuvers.forEach(function (item) {
                        var row = $('<tr />').addClass('point');
                        $('<img />').attr('src', item.iconUrl).appendTo($('<td/>').appendTo(row));
                        var textCell = $('<td />').addClass('text');
                        textCell.html(item.narrative);

                        textCell.appendTo(row);

                        var distCell = $('<td />').addClass('distance');
                        distCell.html(Convert.toDistance(item.distance))
                        distCell.appendTo(row);

                        row.appendTo($("#directionsPanel"));
                    });
                    var latLngs = [], sp = response.route.shape.shapePoints;
                    for (var k = 0; k < sp.length; k += 2) {
                        latLngs.push(new L.LatLng(sp[k], sp[k + 1]));
                    }
                    if (lastPoly) map.removeLayer(lastPoly);
                    lastPoly = new L.Polyline(latLngs);
                    map.addLayer(lastPoly);
                });
                /*
                 callback=e&outFormat=json&routeType=shortest&timeType=1&enhancedNarrative=false
                 &shapeFormat=raw&generalize=200&locale=en_GB&unit=m
                 &from=38.89403,-77.075555&to=38.84457,-77.078222
                 &drivingStyle=2&highwayEfficiency=21.0
                 */
            }
        }, null, {enableHighAccuracy:true}