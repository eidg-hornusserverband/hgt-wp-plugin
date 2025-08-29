
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
	valueNames.push('team');
	valueNames.push('gegner');
	valueNames.push({ name: 'spielLink', attr: 'href' });
	valueNames.push({ name: 'gegnerSpielLink', attr: 'href' });

	var options = {
		valueNames: valueNames,
		listClass: 'hg_list',
		item: 'hg_tr_template'
	};

	var dataList = new List('hg_data', options);

	document.getElementById('hg_jahrSelect').addEventListener("change", getData);
	document.getElementById('hg_teamSelect').addEventListener("change", getData);

	function getData() {
		var jahr = hgvScriptData.jahr;
		var teams = hgvScriptData.mannschaft;

		if (jahr && teams && teams.length > 0) {
			var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spiele/' + teams + '?jahr=' + jahr;
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

		results.forEach(function (row) {
			row.datumDisplay = row.datum.substring(8, 10) + '.' + row.datum.substring(5, 7) + '.' + row.datum.substring(0, 4);
			row.zeit = row.datum.substring(11);
			row.spielLink = 'https://hgverwaltung.ch/embed/1/detail.html?spielId=' + row.id + '&club=' + club;
			row.gegnerSpielLink = 'https://hgverwaltung.ch/embed/1/detail.html?gegner=1&spielId=' + row.id + '&club=' + club;
		});
		dataList.add(results);

		dataList.sort('datum', { order: "asc" });
	}

})();
