var map;
		var locations = [];
		var index;
		var markerGroup;
		function initialize() {
			map = L.map('mapid').setView([46.8770593, 8.0429356], 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 18
			}).addTo(map);

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
		function showData(data) {
			if (markerGroup) {
				markerGroup.removeFrom(map);
			}
			markerGroup = L.layerGroup(null).addTo(map);

			var positions = [];
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
				L.marker([data[i].lat, data[i].lng]).bindPopup(info).addTo(markerGroup);
				positions.push([data[i].lat, data[i].lng]);
			}
			map.fitBounds(positions);
		}

		initialize();

