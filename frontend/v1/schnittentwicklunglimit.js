(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

		document.getElementById('hg_teamSelect').addEventListener("change", getData);
		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		function getData() {
			var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
				return v.value;
			});
			var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;

			if (teams && teams.length > 0) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/jahredurchschnitt/' + teams.join(',').replace(/\//g,'--') + '?limite=5&alle=' + alle;
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
					showData(results);
				});
			}
			else {
				showData({ jahre: [] });
			}
		}

		function showData(results) {
			if (results.jahre.length === 0) {
				document.getElementById('hg_data').style.display = 'none';
				return;
			}
			document.getElementById('hg_data').style.display = '';

			var tableHeaderTr = document.getElementById('hg_header');
			while (tableHeaderTr.firstChild) {
				tableHeaderTr.removeChild(tableHeaderTr.firstChild);
			}

			var tableTemplateTr = document.getElementById('hg_tr_template');
			while (tableTemplateTr.firstChild) {
				tableTemplateTr.removeChild(tableTemplateTr.firstChild);
			}

			var hgList = document.getElementById('hg_list');
			while (hgList.firstChild) {
				hgList.removeChild(hgList.firstChild);
			}

			var th = document.createElement('th');
			th.classList.add('sort');
			th.dataset.sort = 'nachname';
			th.innerHTML = "Nachname";
			tableHeaderTr.appendChild(th);

			var td = document.createElement('td');
			td.classList.add('nachname');
			tableTemplateTr.appendChild(td);

			th = document.createElement('th');
			th.classList.add('sort');
			th.dataset.sort = 'vorname';
			th.innerHTML = "Vorname";
			tableHeaderTr.appendChild(th);

			td = document.createElement('td');
			td.classList.add('vorname');
			tableTemplateTr.appendChild(td);

			for (var j = 0; j < results.jahre.length; j++) {
				th = document.createElement('th');
				th.innerHTML = results.jahre[j];
				th.classList.add('hg_number');
				tableHeaderTr.appendChild(th);

				td = document.createElement('td');
				td.classList.add('j' + results.jahre[j]);
				td.classList.add('hg_number');
				tableTemplateTr.appendChild(td);
			}

			var valueNames = ['nachname', 'vorname'];
			for (var y = 0; y < results.jahre.length; y++) {
				valueNames.push('j' + results.jahre[y]);
			}

			var options = {
				valueNames: valueNames,
				listClass: 'hg_list',
				item: 'hg_tr_template'
			};

			var dataList = new List('hg_data', options);

			results.spieler.forEach(function (row) {
				for (var y = 0; y < results.jahre.length; y++) {
					var rs = row.schnitt[y];
					if (rs) {
						row['j' + results.jahre[y]] = rs.toFixed(2);
					}
				}
			});

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

			//sortierung nach nachname
			dataList.sort('nachname', { order: "asc" });
		}

	})();

