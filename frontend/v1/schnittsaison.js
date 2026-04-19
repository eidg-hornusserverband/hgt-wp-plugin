(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}

		var mannschaft = hgvScriptData.hgv_mannschaft;
		if (!mannschaft) {
			
		}

		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

		var hgDataTable = document.getElementById("hg_data");
		hgDataTable.createTHead();

		document.getElementById('hg_jahrSelect').addEventListener("change", getData);
		document.getElementById('hg_teamSelect').addEventListener("change", getData);
		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		var fortlaufendCB = document.getElementById('hg_fortlaufend').querySelectorAll("input");
		fortlaufendCB[0].addEventListener("change", getData);

		var anzahlTf = document.getElementById('hg_anzahl').querySelectorAll("input");
		anzahlTf[0].addEventListener("change", getData);

		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var teams;
			if (!mannschaft) {
				teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
					return v.value;
				});
			} else {
			    teams = mannschaft.split(',');
			}
			var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;
			var fortlaufend = document.querySelector('#hg_fortlaufend input:checked') !== null;
			var anzahl = document.querySelector('#hg_anzahl input').value;

			if (jahr && teams && teams.length > 0) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/saisondurchschnitt/' + teams.join(',').replace(/\//g,'--') + '?alle=' + alle + '&jahr=' + jahr + '&fortlaufend=' + fortlaufend;
				if (anzahl) {
					url += '&limite=' + anzahl;
				}
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
					showData(results);
				});
			}
			else {
				showData({ spieler: [], spielInfos: [] });
			}
		}

		function getHeader(spielInfos) {
			var code = [];

			code.push('<tr>');
			code.push('<th class="sort" data-sort="nachname">Nachname</th>');
			code.push('<th class="sort" data-sort="vorname">Vorname</th>');
			for (var i = 0; i < spielInfos.length; i++) {
				code.push('<th class="sort hg_number" data-sort="spiel_' + (i + 1) + '"><span class="hint--top" aria-label="' + (spielInfos[i].gegner ? spielInfos[i].gegner : '') + '">' + spielInfos[i].datum + '</span></th>');
			}
			code.push('</tr>');

			return code.join('');
		}

		function getTemplateRow(len) {
			var code = [];
			code.push('<td class="nachname"></td>');
			code.push('<td class="vorname"></td>');

			for (var i = 0; i < len; i++) {
				code.push('<td class="spiel_' + (i + 1) + ' hg_number"></td>');
			}

			return code.join('');
		}

		function showData(results) {
			//remove datatable content
			var thead = document.getElementById('hg_data').getElementsByTagName('thead')[0];
			while (thead.firstChild) {
				thead.removeChild(thead.firstChild);
			}
			var tbody = document.getElementById('hg_data').getElementsByTagName('tbody')[0];
			while (tbody.firstChild) {
				tbody.removeChild(tbody.firstChild);
			}

			if (results.spielInfos.length === 0) {
				document.getElementById('hg_data').style.display = 'none';
				return;
			}
			document.getElementById('hg_data').style.display = '';

			thead.innerHTML = getHeader(results.spielInfos);

			var templateRow = document.getElementById('hg_tr_template');
			templateRow.innerHTML = getTemplateRow(results.spielInfos.length);

			results.spieler.forEach(function (row) {
				for (var i = 0; i < results.spielInfos.length; i++) {
					if (row.schnitt && row.schnitt[i]) {
						var schnitt = row.schnitt[i];
						if (schnitt) {
							row['spiel_' + (i + 1)] = schnitt.toFixed(2);
						}
					}
				}
			});


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
			dataList.add(results.spieler);

			// css class 'minus' und 'plus' hinzufügen
			var i = 0;
			var srows = document.getElementById('hg_list').querySelectorAll('tr');
			for (; i < srows.length; i++) {
				var srow = srows[i];
				var tds = srow.querySelectorAll('.hg_number');
				var lastValue, value;
				if (tds.length >= 1) {
					lastValue = parseFloat(tds[0].textContent);
				}
				for (var j = 1; j < tds.length; j++) {
					if (tds[j].textContent !== '') {
						value = parseFloat(tds[j].textContent);
						if (value >= lastValue) {
							tds[j].classList.add('plus');
						}
						else if (value < lastValue) {
							tds[j].classList.add('minus');
						}
						lastValue = value;
					}
				}
			}

			//sortierung nach letzer column
			dataList.sort('spiel_' + results.spielInfos.length, { order: "desc" });

		}

	})();

