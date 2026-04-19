(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
			club = 'test';
		}

		var allspiele = [];
		var allspieleloaded = false;

		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getYearData);
		loadSpielerSelect('https://www.hgverwaltung.ch/api/1/' + club + '/spieler', 'hg_spielerSelect', true, getData);

		var hgDataTable = document.getElementById("hg_data");
		hgDataTable.createTFoot();

		var valueNames = [];
		var tdElements = document.getElementById('hg_tr_template').getElementsByTagName('td');
		for (var v = 0; v < tdElements.length; v++) {
			valueNames.push(tdElements[v].classList[0]);
		}

		var options = {
			valueNames: valueNames,
			listClass: 'hg_list',
			item: 'hg_tr_template'
		};

		var dataList = new List('hg_data', options);

		document.getElementById('hg_jahrSelect').addEventListener("change", getYearData);
		document.getElementById('hg_spielerSelect').addEventListener("change", getData);
		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		document.getElementById('punkteButton').addEventListener('click', onPunkteButtonClick);
		document.getElementById('punkteSchnittButton').addEventListener('click', onPunkteSchnittButtonClick);
		document.getElementById('punkteTotalButton').addEventListener('click', onPunkteTotalButtonClick);
		document.getElementById('rangpunkteButton').addEventListener('click', onRangpunkteButtonClick);
		document.getElementById('streicheButton').addEventListener('click', onStreicheButtonClick);

		function onPunkteButtonClick() {
			showDiagram(displayedResults, drawPunkteChart);
		}

		function onPunkteSchnittButtonClick() {
			showDiagram(displayedResults, drawPunkteSchnittChart);
		}

		function onPunkteTotalButtonClick() {
			var modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['overlay', 'button', 'escape'],
				closeLabel: "Schliessen",
			});

			var rnd = (Math.random() + 1).toString(36).substring(7);
			var html = [];
			html.push('<span id="hg_calc_label">Berechnung:</span>');
			html.push('<span class="hg_calc" id="hg_calc_'+rnd+'">');
			html.push('<input type="radio" name="calc" value="1" checked>Total');
			html.push('<input type="radio" name="calc" value="0">Pro Ries');
			html.push('</span>');
			html.push('<div id="chart-container" style="position: relative; width:100%">');
			html.push('<canvas id="'+rnd+'"></canvas>');
			html.push('</div>');

			modal.setContent(html.join(''));
			modal.open();
			drawPunkteTotalChart(displayedResults, rnd);

			var allRadios = document.getElementById('hg_calc_'+rnd).querySelectorAll("input");
			allRadios[0].addEventListener("change", function () { drawPunkteTotalChart(displayedResults, rnd); });
			allRadios[1].addEventListener("change", function () { drawPunkteTotalChart(displayedResults, rnd); });
		}

		function onRangpunkteButtonClick() {
			var modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['overlay', 'button', 'escape'],
				closeLabel: "Schliessen",
			});

			var rnd = (Math.random() + 1).toString(36).substring(7);
			var html = [];
			html.push('<div id="chart-container" style="position: relative; width:100%">');
			html.push('<canvas id="'+rnd+'"></canvas>');
			html.push('</div>');

			modal.setContent(html.join(''));
			modal.open();
			drawRangpunkteChart(displayedResults, rnd);
		}

		function onStreicheButtonClick() {
			showDiagram(displayedResults, drawStreicheChart);
		}

		function showDiagram(results, drawFunction) {
			var modal = new tingle.modal({
				footer: false,
				stickyFooter: false,
				closeMethods: ['overlay', 'button', 'escape'],
				closeLabel: "Schliessen",
			});
			var rnd = (Math.random() + 1).toString(36).substring(7);
			modal.setContent(createDiagramHtml(results, rnd));
			modal.open();
			drawFunction(results, rnd);
		}

		function createDiagramHtml(results, rnd) {
			var html = [];

			html.push('<div id="chart-container" style="position: relative; width:100%">');
			html.push('<canvas id="'+rnd+'"></canvas>');
			html.push('</div>');

			return html.join('');
		}

		function drawPunkteTotalChart(results, rnd) {

			var ds = [];
			var high = [];
			var low = [];
			var labels = [];
			var average = [];

			var proRies = document.querySelector('#hg_calc_'+rnd+' input[name="calc"]:checked').value === "0";
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

			var ctx = document.getElementById(rnd).getContext("2d");
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
						label: 'Hoechstes Total',
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
									return value[0];
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

		function drawRangpunkteChart(results, rnd) {
			var labels = [];
            var ds = [];
			var rp = [];

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
					ds.push(total);
                    rp.push(row.rangpunkte || 0);
					var hdate = row.datum.substr(8, 2) + '.' + row.datum.substr(5, 2) + '.' + row.datum.substr(0, 4);
					labels.push([hdate, row.art, row.gegner]);
				}
			});

			var ctx = document.getElementById(rnd).getContext("2d");
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
						label: 'Punkte',
						fill: true,
						borderWidth: 2,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'green',
						lineTension: 0
					}, {
						data: rp,
						label: 'Rangpunkte',
						fill: true,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'red',
						lineTension: 0,
						pointStyle: 'rect'
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
									return value[0];
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

		function drawPunkteSchnittChart(results, rnd) {
			var ds = [];
			var high = [];
			var low = [];
			var labels = [];

			results.forEach(function (row) {
				var total = 0;
				var count = 0;
				var h = 0;
				var l = 100;

				for (i = 0; i < 8; i++) {
					var p = row['ries' + (i + 1)];
					if (p > 0 || p === 0) {
						count++;
						total += p;
						h = Math.max(h, p);
						l = Math.min(l, p);
					}
				}

				if (count > 0) {
					ds.push(total / count);
					high.push(h);
					low.push(l);
					var hdate = row.datum.substr(8, 2) + '.' + row.datum.substr(5, 2) + '.' + row.datum.substr(0, 4);
					labels.push([hdate, row.art, row.gegner]);
				}
			})

			var ctx = document.getElementById(rnd).getContext("2d");
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
						label: 'Punktedurchschnitt',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'blue',
						lineTension: 0
					}, {
						data: high,
						label: 'Laengster Streich',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'green',
						lineTension: 0,
						pointStyle: 'rect'
					}, {
						data: low,
						label: 'Kuerzester Streich',
						fill: false,
						borderWidth: 1,
						pointRadius: 6,
						pointHoverRadius: 7,
						borderColor: 'red',
						lineTension: 0,
						pointStyle: 'triangle'
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
									return value[0];
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
								max: 30,
								stepSize: 5
							}
						}]
					}
				}
			});
		}

		function drawStreicheChart(results, rnd) {

			var data = [];
			var labels = [];
			var i, r;

			for (i = 0; i <= 30; i++) {
				data.push(0);
				labels.push(i);
			}

			for (i = 0; i < results.length; i++) {
				for (r = 1; r <= 8; r++) {
					var ries = results[i]['ries' + r];
					if (ries > 0 || ries === 0) {
						data[ries]++;
					}
				}
			}


			var ctx = document.getElementById(rnd).getContext("2d");
			if (this.myChart) {
				this.myChart.destroy();
			}
			this.myChart = new Chart(ctx, {
				type: 'bar',
				width: 200,
				height: 200,
				data: {
					labels: labels,
					datasets: [{
						data: data,
						backgroundColor: '#AAAAAA'
					}]
				},
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							gridLines: {
								display: false
							},
							scaleLabel: {
								display: true,
								labelString: 'Punkte'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Anzahl'
							},
							ticks: {
								min: 0,
								suggestedMax: 30,
								stepSize: 5
							}
						}]
					}
				}
			});
		}

		function drawPunkteChart(results, rnd) {
			var data = [];
			var labels = [];

			results.forEach(function (row) {
				for (var i = 0; i < 8; i++) {
					var p = row['ries' + (i + 1)];
					if (p > 0 || p === 0) {
						data.push(p);
						var hdate = row.datum.substr(8, 2) + '.' + row.datum.substr(5, 2) + '.' + row.datum.substr(0, 4);
						labels.push([hdate, row.art, row.gegner, (i + 1) + '. Ries']);
					}
				}
			})

			var ctx = document.getElementById(rnd).getContext("2d");
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
						data: data,
						fill: false,
						pointRadius: 6,
						pointHoverRadius: 8,
						pointBackgroundColor: 'lightblue',
						showLine: false
					}]
				},
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							display: false,
							gridLines: {
								display: false
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
								max: 30,
								stepSize: 5
							}
						}]
					}
				}
			});

		}

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
					displayedResults = results;
					showData(results);
				});
			}
			else {
				showData([]);
			}
		}

		function showData(results) {
			dataList.clear();

			//remove total rows
			var tfoot = document.getElementById('hg_data').getElementsByTagName('tfoot')[0];
			while (tfoot.firstChild) {
				tfoot.removeChild(tfoot.firstChild);
			}

			if (results.length === 0) {
				document.getElementById('hg_data').style.display = 'none';
				return;
			}
			document.getElementById('hg_data').style.display = '';

			var totalRies = [];
			var totalPunkte = 0;
			var totalStreiche = 0;
			var i;
			for (i = 0; i < 8; i++) {
				totalRies.push(0);
			}

			results.forEach(function (row) {
				if (row.punkte) {
					totalPunkte += row.punkte;
				}
				if (row.streiche) {
					totalStreiche += row.streiche;
				}
				if (row.schnitt) {
					row.schnitt = row.schnitt.toFixed(2);
				}
				if (row.schnittKumuliert) {
					row.schnittKumuliert = row.schnittKumuliert.toFixed(2);
				}
				row.datumDisplay = row.datum.substring(8, 10) + '.' + row.datum.substring(5, 7) + '.' + row.datum.substring(0, 4);
				for (i = 0; i < 8; i++) {
					if (row['ries' + (i + 1)]) {
						totalRies[i] += row['ries' + (i + 1)];
					}
				}
			});
			dataList.add(results);
			dataList.sort('datum', { order: "asc" });

			var totalRow = document.getElementById('hg_total_tr').cloneNode(true);
			for (i = 0; i < 8; i++) {
				if (totalRies[i] > 0) {
					totalRow.querySelector(".total_ries" + (i + 1)).textContent = totalRies[i];
				}
			}
			totalRow.querySelector(".total_punkte").textContent = totalPunkte;
			totalRow.querySelector(".total_streiche").textContent = totalStreiche;

			if (totalPunkte && totalStreiche) {
				var schnitt = (totalPunkte / totalStreiche).toFixed(2);
				totalRow.querySelector(".total_schnitt").textContent = schnitt;
			}

			tfoot.appendChild(totalRow);
		}

	})();

