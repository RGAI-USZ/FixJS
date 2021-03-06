function() {

	var map = null;
	var markerGroup = null;

	function calculateCenterAndZoom(monuments) {
		var center = {lat: 0, lon: 0},
			max = {lat: -999, lon: -999},
			min = {lat: 999, lon: 999},
			count = 0,
			location = {},
			visible,
			dist = {lat: 0, lon: 0},
			zoom = 0;
		$.each(monuments, function(i, item) {
			if (item.lat || item.lon) {
				// Only count things that aren't at (0, 0)
				if (item.lat < min.lat) {
					min.lat = item.lat;
				}
				if (item.lon < min.lon) {
					min.lon = item.lon;
				}
				if (item.lat > max.lat) {
					max.lat = item.lat;
				}
				if (item.lon > max.lon) {
					max.lon = item.lon;
				}
				count++;
			}
		});
		if (count === 0) {
			// Seriously?
			location = {center: {lat: 0, lon: 0}, zoom: 1};
		} else {
			center.lat = (min.lat + max.lat) / 2;
			center.lon = (min.lon + max.lon) / 2;
			dist.lat = max.lat - min.lat;
			dist.lon = max.lon - min.lon;
			dist = Math.max(dist.lat,dist.lon);
			visible = 360;
			for (zoom = 1; zoom < 18; zoom++) {
				visible /= 2;
				if (dist >= visible) {
					break;
				}
			}
			location = { center: center, zoom: zoom -1 };
		}
		return location;
	}

	function setupPinchToZoom(id) {
		if (window.plugins !== undefined && window.plugins.pinchZoom !== undefined && navigator.userAgent.match(/Android 2/)) {
			var origDistance;
			window.plugins.pinchZoom.addEventListener('pinchzoom', function(event) {
				if (map && $("#" + id).is(':visible')) {
					if(event.type === "pinchzoomstart") {
						origDistance = event.distance;
					}
					else if (event.type === "pinchzoommove" || event.type === "pinchzoomend") {
						var ratio = event.distance / origDistance;
						if (ratio < 0.67) {
							// Zooming out
							origDistance = event.distance;
							map.zoomOut();
						} else if (ratio > 1.5) {
							// Zooming in
							origDistance = event.distance;
							map.zoomIn();
						}
					}
				}
			});
		}
	}

	function init() {
		if (!map) {
			// Disable webkit 3d CSS transformations for tile positioning
			// Causes lots of flicker in PhoneGap for some reason...
			L.Browser.webkit3d = false;
			map = new L.Map('map', {
				touchZoom: true, // force on for Android 3/4
				zoomControl: false // disable in favor of pinch-zoom
			});
			var tiles = new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
				maxZoom: 18,
				subdomains: '1234'
			});
			map.addLayer(tiles);

			map.attributionControl.setPrefix("");
			map.attributionControl.addAttribution(
				'<span class=".map-attribution">' + mw.message("attribution-mapquest") + '</span>'
				);
			map.attributionControl.addAttribution(
				'<br /><span class=".map-attribution">' + mw.message("attribution-osm") + '</span>'
				);

			$(".map-attribution a").bind('click', function(event) {
				// Force web links to open in external browser
				// instead of the app, where navigation will be broken.
				// TODO: define chrome
				// chrome.openExternalLink(this.href);
				event.preventDefault();
			});

			markerGroup = new L.LayerGroup();
			map.addLayer(markerGroup);
			setupPinchToZoom('map');
		}
	}

	function showMap() {
		$("#map").show();
		// Makes leaflet aware of its' position - avoids 'wrong center' problem
		map.invalidateSize();
	}

	function hideMap() {
		$("#map").hide();
	}

	function clear() {
		markerGroup.clearLayers();
	}

	function addMonument(monument, onClick) {
		var marker = new L.Marker(new L.LatLng(monument.lat, monument.lon));
		var popup = "<div><strong>" + monument.name + "</strong></div>";
		var popupDOM = $(popup).click(function() {
			onClick(monument);
		})[0];
		marker.bindPopup(popupDOM, {closeButton: false});
		markerGroup.addLayer(marker);
	}

	function setCenterAndZoom(center, zoom) {
		map.setView(new L.LatLng(center.lat, center.lon), zoom);
	}

	return {
		init: init,
		clear: clear,
		addMonument: addMonument,
		calculateCenterAndZoom: calculateCenterAndZoom,
		setCenterAndZoom: setCenterAndZoom,
		showMap: showMap,
		hideMap: hideMap
	};

}