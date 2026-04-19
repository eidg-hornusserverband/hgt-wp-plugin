(function () {
			var colorHelper = Chart.helpers.color;
			var colors = [
				"rgb(54, 162, 235)",
				"rgb(255, 99, 132)",
				"rgb(75, 192, 192)",
				"rgb(201, 203, 207)",
				"rgb(255, 159, 64)",
				"rgb(153, 102, 255)",
				"rgb(255, 205, 86)"
			];

			var club = hgvScriptData.hgv_code;
			if (!club) {
		  		club = 'test';
			}
			hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);

			document.getElementById('hg_jahrSelect').addEventListener("change", getData);

			var allRadios = document.getElementById('hg_alle').querySelectorAll("input");
			allRadios[0].addEventListener("change", getData);
			allRadios[1].addEventListener("change", getData);

			function getData() {
				var jahr = document.getElementById('hg_jahrSelect').value;
				var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;

				if (jahr) {
					var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/streicheProMannschaft?alle=' + alle + '&jahr=' + jahr;
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
				if (!results && results.length === 0) {
					return;
				}

				var labels = results.map(function (row) {
					return row.streich;
				});

				var teams = [];
				Object.keys(results[0]).forEach(function (k) {
					if (k !== 'streich') {
						teams.push(k);
					}
				});

				var datasets = {};
				var i = 0;
				for (; i < teams.length; i++) {
					datasets[teams[i]] = {
						label: teams[i],
						data: [],
						borderWidth: 1,
						backgroundColor: colorHelper(colors[i % 7]).alpha(0.5).rgbString(),
						borderColor: colors[i % 7],
					};
				}

				results.forEach(function (row) {
					teams.forEach(function (t) {
						datasets[t].data.push(row[t]);
					});
				});

				var ds = [];
				teams.forEach(function (t) {
					ds.push(datasets[t]);
				});


				var ctx = document.getElementById("chart").getContext('2d');
				var myChart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: labels,
						datasets: ds
					},
					options: {
						events: ['click'],
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								}
							}]
						}
					}
				});

			}

		})();

