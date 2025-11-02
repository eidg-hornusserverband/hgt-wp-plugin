(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?ignoriereNachwuchs=true&spiele=true', 'hg_teamSelect', true, getData);

		var hgDataTable = document.getElementById("hg_data");
		hgDataTable.createTFoot();
		hgDataTable.createTHead();

		document.getElementById('hg_jahrSelect').addEventListener("change", getData);
		document.getElementById('hg_teamSelect').addEventListener("change", getData);

		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
				return v.value;
			});

			if (jahr && teams && teams.length > 0) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/rangpunkte/' + teams.join(',').replace(/\//g,'--') + '?jahr=' + jahr;
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
					showData(results);
				});
			}
			else {
				showData({ rangpunkte: [], spielInfos: [] });
			}
		}

		function getHeader(spielInfos) {
			var code = [];

			code.push('<tr>');
			code.push('<th class="sort" data-sort="nachname">Nachname</th>');
			code.push('<th class="sort" data-sort="vorname">Vorname</th>');
			for (var i = 0; i < spielInfos.length; i++) {
				code.push('<th class="sort hg_number" data-sort="spiel_' + (i + 1) + '"><span class="hint--top" aria-label="' + (spielInfos[i].gegner ? spielInfos[i].gegner : '')  + '">' + spielInfos[i].datum + '</span></th>');
			}
			code.push('<th class="sort hg_number" data-sort="total">Total</th>');
			code.push('<th class="sort hg_number" data-sort="totalVorjahr">Total Vorjahr</th>');
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
			code.push('<td class="total hg_number"></td>');
			code.push('<td class="totalVorjahr hg_number"></td>');

			return code.join('');
		}

		function getTotalTemplateRow(len) {
			var code = [];
			code.push('<td colspan="2" class="total_label"></td>');
			for (var i = 0; i < len; i++) {
				code.push('<td class="total_' + (i + 1) + ' hg_number"></td>');
			}
			code.push('<td></td>');
			code.push('<td></td>');
			return code.join('');
		}

		function showData(results) {

			//remove datatable content
			var tfoot = document.getElementById('hg_data').getElementsByTagName('tfoot')[0];
			while (tfoot.firstChild) {
				tfoot.removeChild(tfoot.firstChild);
			}
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

			var totalTemplateRow = document.getElementById('hg_total_tr');
			totalTemplateRow.innerHTML = getTotalTemplateRow(results.spielInfos.length);

			var totals = [];
			var over20 = [];
			var noSpieler = [];

			var i;
			for (i = 0; i < results.spielInfos.length; i++) {
				totals[i] = 0;
				over20[i] = 0;
				noSpieler[i] = 0;
			}

			results.rangpunkte.forEach(function (row) {
				for (var i = 0; i < results.spielInfos.length; i++) {
					if (row.rangpunkte && row.rangpunkte[i]) {
						var rp = row.rangpunkte[i];
						row['spiel_' + (i + 1)] = rp;
						totals[i] += rp;
						if (rp >= 20) {
							over20[i]++;
						}
						noSpieler[i]++;
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
			dataList.add(results.rangpunkte);

			// css class 'over20' hinzufügen wenn rangpunkt grösser oder gleich 20 ist
			var tds = document.getElementById('hg_data').getElementsByTagName('td');
			for (i = 0; i < tds.length; i++) {
				var td = tds[i];
				if (td.classList.contains("hg_number") && !td.classList.contains("total") && !td.classList.contains("totalVorjahr")) {
					if (parseInt(td.textContent) >= 20) {
						td.classList.add('over20');
					}
				}
			}

			//sortierung nach total
			dataList.sort('total', { order: "desc" });

			// total rangpunkte
			var totalRow = document.getElementById('hg_total_tr').cloneNode(true);
			totalRow.querySelector(".total_label").textContent = 'Total';
			for (i = 0; i < totals.length; i++) {
				totalRow.querySelector(".total_" + (i + 1)).textContent = totals[i];
			}
			tfoot.appendChild(totalRow);

			// 20 und mehr
			totalRow = document.getElementById('hg_total_tr').cloneNode(true);
			totalRow.querySelector(".total_label").textContent = '20 Rangpunkte und mehr';
			for (i = 0; i < over20.length; i++) {
				totalRow.querySelector(".total_" + (i + 1)).textContent = over20[i];
			}
			tfoot.appendChild(totalRow);

			// total spieler
			totalRow = document.getElementById('hg_total_tr').cloneNode(true);
			totalRow.querySelector(".total_label").textContent = 'Spieler mit Rangpunkten';
			for (i = 0; i < noSpieler.length; i++) {
				totalRow.querySelector(".total_" + (i + 1)).textContent = noSpieler[i];
			}
			tfoot.appendChild(totalRow);

		}

	})();

