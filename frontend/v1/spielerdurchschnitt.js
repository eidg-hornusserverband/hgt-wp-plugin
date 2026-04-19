(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
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

		document.getElementById('hg_jahrSelect').addEventListener("change", getData);
		document.getElementById('hg_spielerSelect').addEventListener("change", getData);
		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

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

		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var spielerId = document.getElementById('hg_spielerSelect').value;
			var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;

			if (jahr && spielerId) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spielerdurchschnitt/' + spielerId + '?alle=' + alle + '&jahr=' + jahr;
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
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

