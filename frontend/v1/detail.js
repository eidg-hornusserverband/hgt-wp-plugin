(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}
		var spielId = hgutil.getParameterByName('spielId');
		if (!spielId) {
			return;
		}
		var gegnerQuery = '';
		var spielerProperty = 'spieler';
		if (hgutil.getParameterByName('gegner') === '1') {
			gegnerQuery = '?gegner=1';
			spielerProperty = 'gegnerSpieler';
		}

		var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spiel/' + spielId + gegnerQuery;

		fetch(url).then(function (response) {
			return response.json();
		}).then(function (result) {
			showData(result);
		});

		function showData(result) {
			var d = result.datum;

			var map = {
				hg_art: result.art,
				hg_datum: d.substring(8, 10) + '.' + d.substring(5, 7) + '.' + d.substring(0, 4) + ' ' + d.substring(11)
			};

			map.hg_mann1 = result.team;
			map.hg_mann1_link = 'detail.html?spielId=' + spielId;
			map.hg_rp1 = result.rangPunkte;
			map.hg_nr1 = result.totalNr;
			map.hg_pu1 = result.schlagPunkte;


			map.hg_mann2 = result.gegner;
			map.hg_mann2_link = 'detail.html?gegner=1&spielId=' + spielId;
			map.hg_rp2 = result.rangPunkteGegner;
			map.hg_nr2 = result.totalNrGegner;
			map.hg_pu2 = result.schlagPunkteGegner;

			map.hg_bericht = result.bericht ? result.bericht : '';

			for (var key in map) {
				if (map.hasOwnProperty(key)) {
					if (map[key] != null) {
						var el = document.getElementById(key);
						if (el) {
							el.innerHTML = map[key];
						}
					}
				}
			}
			document.getElementById('hg_mann1').href = map.hg_mann1_link;
			document.getElementById('hg_mann2').href = map.hg_mann2_link;

			if (!result.meisterschaft) {
				document.getElementById('hg_rp_header').style.display = 'none';
				document.getElementById('hg_rp1').style.display = 'none';
				document.getElementById('hg_rp2').style.display = 'none';
			}

			if (!result[spielerProperty] || result[spielerProperty].len === 0) {
				return;
			}

			// Header			
			var headerRow = [
				'<th class="reihenfolge hg_number">#</th>',
				'<th>Name</th>',
				'<th>Vorname</th>'
			];

			for (var r = 0; r < result.anzahlRies; r++) {
				headerRow.push('<th class="hg_number">' + (r + 1) + '</th>');
			}

			headerRow.push('<th class="hg_number">Total</th>');

			if (result.meisterschaft) {
				headerRow.push('<th class="hg_number">RP</th>');
			}
			if (result.fest) {
				headerRow.push('<th>Ausz.</th>');
			}

			var header = document.getElementById('hg_spieler_header');
			header.innerHTML = headerRow.join('');


			// Spieler
			var spieler = [];
			result[spielerProperty].forEach(function (row) {
				if (!row.ueberzaehlig) {
					spieler.push(createSpielerRow(result, row));
				}
			});

			var tbody = document.getElementById('hg_spieler').getElementsByTagName('tbody')[0];
			tbody.innerHTML = spieler.join('');


			// Total Row
			var totals = [0, 0, 0, 0, 0, 0, 0, 0];
			var grandeTotal = 0;

			result[spielerProperty].forEach(function (row) {
				if (!row.ueberzaehlig) {
					for (var l = 0; l < row.ries.length; l++) {
						if (row.ries[l] !== null) {
							totals[l] += row.ries[l];
							grandeTotal += row.ries[l];
						}
					}
				}
			});

			var totalRow = [
				'<tr class="total">',
				'<td colspan="3"></td>',
			];
			for (var r = 0; r < result.anzahlRies; r++) {
				totalRow.push('<td class="hg_number">' + totals[r] + '</td>');
			}
			totalRow.push('<td class="hg_number">' + grandeTotal + '</td>');
			totalRow.push('</tr>');

			var tfoot = document.getElementById('hg_spieler').getElementsByTagName('tfoot')[0];
			tfoot.innerHTML = totalRow.join('');


			// Ueberzaehlige Spieler
			var ueberSpieler = [];
			result[spielerProperty].forEach(function (row) {
				if (row.ueberzaehlig) {
					ueberSpieler.push(createSpielerRow(result, row));
				}
			});

			var tbody = document.getElementById('hg_ueber_spieler').getElementsByTagName('tbody')[0];
			tbody.innerHTML = ueberSpieler.join('');
		}

		function createSpielerRow(result, spieler) {

			var len = result.anzahlRies;
			var ms = result.meisterschaft;
			var fest = result.fest;
			
			var rowTotal = 0;

			var row = [
				'<tr>',
				'<td class="reihenfolge hg_number">' + spieler.reihenfolge + '</td>',
				'<td class="nachname">' + spieler.nachname + '</td>',
				'<td class="vorname">' + spieler.vorname + '</td>',
			];

			for (var r = 0; r < len; r++) {
				var rs = '<td class="ries hg_number">';
				var value = spieler.ries[r];
				if (spieler.nr[r]) {
					rs += '<span class="nr">';
				}

				if (value !== null) {
					rowTotal += value;
					if (value < 10) {
						rs += '0';
					}
					rs += value;
				}

				if (spieler.nr[r]) {
					rs += '</span>';
				}

				row.push(rs + '</td>');

			}

			row.push('<td class="total hg_number">' + rowTotal + '</td>');

			if (ms) {
				row.push('<td class="rangpunkt hg_number">' + (spieler.rangpunkte ? spieler.rangpunkte : '') + '</td>');
			}
			if (fest) {
				row.push('<td>' + (spieler.auszeichnung ? spieler.auszeichnung : '') + '</td>');
			}

			row.push('</tr>');
			return row.join('');
		}

	})();

