(function () {
		var club = hgvScriptData.hgv_code;
		if (!club) {
		  club = 'test';
		}

		var valueNames = [];
		var tdElements = document.getElementById('hg_tr_template').getElementsByTagName('td');
		for (var v = 0; v < tdElements.length; v++) {
			if (tdElements[v].classList.length > 0) {
				valueNames.push(tdElements[v].classList[0]);
			}
		}

		var options = {
			valueNames: valueNames,
			listClass: 'hg_list',
			item: 'hg_tr_template'
		};

		var dataList = new List('hg_data', options);

		getData();

		function getData() {
			var jahr = new Date().getFullYear();
			var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/saisondurchschnittgespielt/A?alle=1&jahr=' + jahr + '&limite=3';

			fetch(url).then(function (response) {
				return response.json();
			}).then(function (results) {
				showData(results);
			});
		}

		function showData(results) {
			dataList.clear();

			if (results.spieler.length === 0) {
				document.getElementById('hg_data').style.display = 'none';
				return;
			}
			document.getElementById('hg_data').style.display = '';

			results.spieler.forEach(function (row) {
				if (row.schnitt[0]) {
					row.last3 = row.schnitt[0].toFixed(2);
				}
			});
			dataList.add(results.spieler);

			//sortierung nach letzer column
			dataList.sort('last3', { order: "desc" });
		}

	})();

