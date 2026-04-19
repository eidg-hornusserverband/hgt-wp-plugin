var map;
		var locations = [];
		var index;
		var markers = [];
		function initialize() {

			map = new maplibregl.Map({
				container: 'mapid',
				style: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json',
				center: [8.2765473, 46.938261],
				zoom: 15,
			});
			map.addControl(new maplibregl.NavigationControl({showZoom: true, showCompass: true}));

			var ligaSelection = document.getElementById('ligaSelection');
			ligaSelection.addEventListener('change', onLigaChange);

			var nameFilterInput = document.getElementById('nameFilterInput');
			nameFilterInput.addEventListener('keyup', onNameFilterInputChange);

			getLocations('alle').then(function (data) {
				index = lunr(function () {
					this.ref('id');
					this.field('ort');
					this.field('name');

					var i = 0;
					for (; i < data.length; i++) {
						locations[i] = data[i];
						data[i].id = i;
						this.add(data[i]);
					}
				});
			});
		}
		function onLigaChange(e) {
			document.getElementById('nameFilterInput').value = '';
			getLocations(e.target.value);
		}
		function debounce(func, interval) {
			var lastCall = -1;
			return function () {
				clearTimeout(lastCall);
				var args = arguments;
				var self = this;
				lastCall = setTimeout(function () {
					func.apply(self, args);
				}, interval);
			};
		}
		function onNameFilterInputChange(e) {
			document.getElementById('ligaSelection').value = 'alle';
			debounce(function () {
				if (!e.target.value) {
					showData(locations);
				}
				else {
					var matches = index.search(e.target.value + '*');
					var data = matches.map(function (r) {
						return locations[r.ref];
					});
					showData(data);
				}
			}, 200)();
		}
		function getLocations(liga) {
			var clubs = liga === 'alle';
			return fetch("https://www.hgverwaltung.ch/api/1/clubs/locations/" + liga + "?clubs="+clubs)
				.then(function (response) {
					return response.json();
				}).then(function (results) {
					showData(results);
					return results;
				});
		}

		function clearMarkers() {
			if (markers.length > 0) {
				markers.forEach(m => m.remove());
				markers = [];
			}
		}

		function showData(data) {
			clearMarkers();

			for (var i = 0; i < data.length; i++) {
				var info = '';
				var hp = data[i].homepage;
				if (hp) {
					if (!hp.startsWith('http')) {
						hp = 'http://' + hp;
					}
					info = '<a href="' + hp + '" target="_blank"><h3>' + data[i].name + '</h3></a>'
				} else {
					info = '<h3>' + data[i].name + '</h3>';
				}
				info += '<p>';
				info += '<a href="https://maps.google.com?daddr=' + data[i].lat + ',' + data[i].lng + '" target="_blank">Google Routenplaner</a>';
				info += '</p>';

				markers.push(new maplibregl.Marker({
					color: "#FFD700",
					draggable: false
				}).setLngLat([data[i].lng, data[i].lat]).setPopup(new maplibregl.Popup({offset: 25}).setHTML(
						info
				)).addTo(map));

				if (markers.length > 1) {
					var bounds = markers.reduce(function (bounds, marker) {
						return bounds.extend(marker.getLngLat());
					}, new maplibregl.LngLatBounds());
					map.fitBounds(bounds, {
						padding: 60
					});
				} else if (markers.length === 1) {
					map.setCenter(markers[0].getLngLat());
					map.setZoom(15);
				}
			}
		}

		initialize();

