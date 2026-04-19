(function () {

		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

		var hgDataTable = document.getElementById("hg_data");
		hgDataTable.createTFoot();

		var valueNames = [];
		var tdElements = document.getElementById('hg_tr_template').getElementsByTagName('td');
		for (var v = 0; v < tdElements.length; v++) {
			if (tdElements[v].classList.length > 0) {
				valueNames.push(tdElements[v].classList[0]);
			}
		}
		valueNames.push({ data: ['id'] });
		valueNames.push('spiellistelink');

		var options = {
			valueNames: valueNames,
			listClass: 'hg_list',
			item: 'hg_tr_template'
		};

		var dataList = new List('hg_data', options);

		document.getElementById('hg_jahrSelect').addEventListener("change", getData);
		document.getElementById('hg_teamSelect').addEventListener("change", getData);

		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
				return v.value;
			});

			if (jahr && teams && teams.length > 0) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spiele/' + teams.join(',').replace(/\//g,'--') + '?jahr=' + jahr;
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

			if (results.length === 0) {
				document.getElementById('hg_data').style.display = 'none';
				return;
			}
			document.getElementById('hg_data').style.display = '';

			var now = Date.now();

			results.forEach(function (row) {
				row.datumDisplay = row.datum.substring(8, 10) + '.' + row.datum.substring(5, 7) + '.' + row.datum.substring(0, 4);
				row.zeit = row.datum.substring(11);
				var sd = new Date(parseInt(row.datum.substring(0, 4)), parseInt(row.datum.substring(5, 7)) - 1, parseInt(row.datum.substring(8, 10)));

				if (sd.getTime() <= now) {
					row.spiellistelink = 'Spielliste';
				}
			});
			dataList.add(results);

			dataList.sort('datum', { order: "asc" });

			var i = 0;
			var rows = document.getElementById('hg_data').getElementsByTagName('tr');
			for (; i < rows.length; i++) {
				var spielId = rows[i].dataset.id;
				if (spielId) {
					var atags = rows[i].getElementsByTagName('a');
					for (var j = 0; j < atags.length; j++) {
						(function () {
							var atag = atags[j];
							var sid = spielId;
							atag.addEventListener("click", function () {
								var gegner = atag.dataset.gegner;

								var modal = new tingle.modal({
									footer: false,
									stickyFooter: false,
									closeMethods: ['overlay', 'button', 'escape'],
									closeLabel: "Schliessen",
								});

								showDetail(modal, sid, gegner == '1');

							});
						})();
					}
				}
			}
		}

		function showDetail(modal, spielId, gegner) {
			var gegnerQuery = '';
			if (gegner) {
				gegnerQuery = '?gegner=1';
			}

			var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spiel/' + spielId + gegnerQuery;

			fetch(url).then(function (response) {
				return response.json();
			}).then(function (result) {
				modal.setContent(createDetailHtml(result, gegner));
				modal.open();
			});
		}

		function createDetailHtml(result, gegner) {
			var html = [];

			var spielerProperty = 'spieler';
			if (gegner) {
				spielerProperty = 'gegnerSpieler';
			}

			var d = result.datum;

			var map = {
				hg_art: result.art,
				hg_datum: d.substring(8, 10) + '.' + d.substring(5, 7) + '.' + d.substring(0, 4) + ' ' + d.substring(11)
			};

			map.hg_mann1 = result.team;
			map.hg_rp1 = result.rangPunkte;
			map.hg_nr1 = result.totalNr;
			map.hg_pu1 = result.schlagPunkte;

			map.hg_mann2 = result.gegner;
			map.hg_rp2 = result.rangPunkteGegner;
			map.hg_nr2 = result.totalNrGegner;
			map.hg_pu2 = result.schlagPunkteGegner;


			map.hg_bericht = result.bericht ? result.bericht : '';

			html.push('<div class="hg_detail">');
			html.push('<h1 id="hg_title">' + map.hg_art + ' vom ' + map.hg_datum + '</h1>');
			html.push('<table id="hg_header">');
			html.push('<tr>');
			html.push('<th class="mannschaft">Mannschaft</th>');
			if (result.meisterschaft) {
				html.push('<th class="hg_number">Rangpunkte</th>');
			}
			html.push('<th class="hg_number">Nummer</th>');
			html.push('<th class="hg_number">Punkte</th>');
			html.push('</tr>');
			html.push('<tr id="hg_first">');

			html.push('<td>' + map.hg_mann1 + '</td>');
			if (result.meisterschaft) {
				html.push('<td class="hg_number">' + (map.hg_rp1 != null ? map.hg_rp1 : '') + '</td>');
			}
			html.push('<td class="hg_number">' + (map.hg_nr1 != null ? map.hg_nr1 : '') + '</td>');
			html.push('<td class="hg_number">' + (map.hg_pu1 != null ? map.hg_pu1 : '') + '</td>');
			html.push('</tr>');
			html.push('<tr id="hg_second">');
			html.push('<td>' + map.hg_mann2 + '</td>');
			if (result.meisterschaft) {
				html.push('<td class="hg_number">' + (map.hg_rp2 != null ? map.hg_rp2 : '') + '</td>');
			}
			html.push('<td class="hg_number">' + (map.hg_nr2 != null ? map.hg_nr2 : '') + '</td>');
			html.push('<td class="hg_number">' + (map.hg_pu2 != null ? map.hg_pu2 : '') + '</td>');
			html.push('</tr>');
			html.push('</table>');

			html.push('<div id="hg_bericht">' + map.hg_bericht + '</div>');

			if (!result[spielerProperty] || result[spielerProperty].len === 0) {
				return html.join('');
			}

			html.push('<table id="hg_spieler">');
			html.push('<thead>');
			html.push('<tr id="hg_spieler_header">');


			// Header
			html.push('<th class="reihenfolge hg_number">#</th>');
			html.push('<th>Name</th>');
			html.push('<th>Vorname</th>');

			for (var r = 0; r < result.anzahlRies; r++) {
				html.push('<th class="hg_number">' + (r + 1) + '</th>');
			}

			html.push('<th class="hg_number">Total</th>');

			if (result.meisterschaft) {
				html.push('<th class="hg_number">RP</th>');
			}
			if (result.fest) {
				html.push('<th>Ausz.</th>');
			}

			html.push('</tr>');
			html.push('</thead>');
			html.push('<tbody>');



			// Spieler
			var spieler = [];
			result[spielerProperty].forEach(function (row) {
				if (!row.ueberzaehlig) {
					spieler.push(createSpielerRow(result, row));
				}
			});

			Array.prototype.push.apply(html, spieler);

			html.push('</tbody>');
			html.push('<tfoot>');


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

			html.push('<tr class="total">');
			html.push('<td colspan="3"></td>');

			for (var r = 0; r < result.anzahlRies; r++) {
				html.push('<td class="hg_number">' + totals[r] + '</td>');
			}
			html.push('<td class="hg_number">' + grandeTotal + '</td>');
			html.push('</tr>');


			html.push('</tfoot>');
			html.push('</table>');


			// Ueberzaehlige Spieler

			html.push('<table id="hg_ueber_spieler">');
			html.push('<tbody>');

			var ueberSpieler = [];
			result[spielerProperty].forEach(function (row) {
				if (row.ueberzaehlig) {
					ueberSpieler.push(createSpielerRow(result, row));
				}
			});

			Array.prototype.push.apply(html, ueberSpieler);

			html.push('</tbody>');
			html.push('</table>');
			html.push('</div>');

			return html.join('');
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

