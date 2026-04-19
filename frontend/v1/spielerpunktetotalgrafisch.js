(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
			club = 'test';
		}

		var allspiele = [];
		var allspieleloaded = false;

		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getYearData);
		loadSpielerSelect('https://www.hgverwaltung.ch/api/1/' + club + '/spieler', 'hg_spielerSelect', true, getData);

		document.getElementById('hg_jahrSelect').addEventListener("change", getYearData);
		document.getElementById('hg_spielerSelect').addEventListener("change", getData);
		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");
		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		allRadios = document.getElementById('hg_calc').querySelectorAll("input");
		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		function loadSpielerSelect(url, elementId, selectFirst, callback) {
			fetch(url)
				.then(function (response) {
					return response.json();
				})
				.then(function (objects) {
					var el = document.getElementById(elementId);

					objects.forEach(function (o) {
						var option = document.createElement("option");
						var jg = o.jahrgang;
						option.text = o.nachname + ' ' + o.vorname + (jg ? ', ' : '') + (jg ? jg : '');
						option.value = o.id;
						el.appendChild(option);
					});

					if (selectFirst) {
						el.selectedIndex = 0;
					}

					if (callback) {
						callback();
					}
				});
		}

		function getYearData() {
			allspieleloaded = false;
			var jahr = document.getElementById('hg_jahrSelect').value;
			fetch('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true')
				.then(function (response) { return response.json(); })
				.then(
				function (teams) {
					var pr = [];
					for (var t = 0; t < teams.length; t++) {
						var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/mannschaftsdurchschnitt/' + teams[t] + '?alle=1' + '&jahr=' + jahr;
						var pro = fetch(url).then(
							function (response) {
								return response.json();
							}
						).then(
							function (spiele) {
								Array.prototype.push.apply(allspiele, spiele);
							}
							);
						pr.push(pro);
					}
					return Promise.all(pr);
				}
				)
				.then(function () { allspieleloaded = true; getData(); })
		}

		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var spielerId = document.getElementById('hg_spielerSelect').value;
			var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;

			if (jahr && spielerId && allspieleloaded) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spielerdurchschnitt/' + spielerId + '?alle=' + alle + '&jahr=' + jahr;
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
					drawChart(results);
				});
			}
			else {
				drawChart([]);
			}
		}

		function drawChart(results) {
			var ds = [];
			var high = [];
			var low = [];
			var labels = [];
			var average = [];

			var proRies = document.querySelector('#hg_calc input[name="calc"]:checked').value === "0";
			results.forEach(function (row) {

				var total = 0;
				var count = 0;

				for (i = 0; i < 8; i++) {
					var p = row['ries' + (i + 1)];
					if (p > 0 || p === 0) {
						count++;
						total += p;
					}
				}

				if (count > 0) {
					var spiel = allspiele.find(function (item) {
						return item.id === row.id;
					});
					if (spiel) {
						if (proRies) {
							high.push(spiel.hoechstesTotal / count);
							low.push(spiel.tiefstesTotal / count);
							average.push(spiel.punkteTotalSchnitt / count);
						}
						else {
							high.push(spiel.hoechstesTotal);
							low.push(spiel.tiefstesTotal);
							average.push(spiel.punkteTotalSchnitt);
						}
					}
					else {
						high.push(0);
						low.push(0);
						average.push(0);
					}
					if (proRies) {
						ds.push(total / count);
					}
					else {
						ds.push(total);
					}
					var hdate = row.datum.substr(8, 2) + '.' + row.datum.substr(5, 2) + '.' + row.datum.substr(0, 4);
					labels.push([hdate, row.art, row.gegner]);
				}
			});

			var ctx = document.getElementById("chart").getContext("2d");
			if (this.myChart) {
				this.myChart.destroy();
			}
			this.myChart = new Chart(ctx, {
				type: 'line',
				width: 200,
				height: 200,
				data: {
					labels: labels,
					datasets: [{
						data: ds,
						label: 'Punktetotal',
						fill: false,
						borderWidth: 2,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'blue',
						lineTension: 0
					}, {
						data: high,
						label: 'H�chstes Total',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'green',
						lineTension: 0,
						pointStyle: 'rect'
					}, {
						data: low,
						label: 'Tiefstes Total',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'red',
						lineTension: 0,
						pointStyle: 'triangle'
					}, {
						data: average,
						label: 'Durchschnitt',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'orange',
						lineTension: 0,
						pointStyle: 'star'
					}]
				},
				options: {
					tooltips: {
						callbacks: {
							title: function (tooltipItem, data) {
								return data.labels[tooltipItem[0].index];
							}
						}
					},
					animation: {
						duration: 400
					},
					legend: {
						display: true
					},
					scales: {
						xAxes: [{
							display: true,
							gridLines: {
								display: true
							},
							ticks: {
								minRotation: 90,
								maxRotation: 90,
								autoSkip: false,
								callback: function (value, index, values) {
									return [value[0], value[2]];
								}
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Punkte'
							},
							ticks: {
								min: 0,
								stepSize: 5
							}
						}]
					}
				}
			});

		}
	})();

