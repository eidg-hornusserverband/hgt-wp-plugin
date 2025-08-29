
(function () {
	var club = hgvScriptData.hgv_code;
	if (!club) {
		club = 'test';
	}

	var aktuellesJahr = (new Date()).getFullYear();
	var jahrSelect = document.getElementById('hg_jahrSelect');
	var option = document.createElement("option");
	option.text = aktuellesJahr;
	option.value = aktuellesJahr;
	jahrSelect.appendChild(option);

	option = document.createElement("option");
	option.text = aktuellesJahr + 1;
	option.value = aktuellesJahr + 1;
	jahrSelect.appendChild(option);

	hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften', 'hg_teamSelect', true, getData);

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
	document.getElementById('hg_teamSelect').addEventListener("change", getData);

	var allRadios = document.getElementById('hg_inklSpiele').querySelectorAll("input");
	allRadios[0].addEventListener("change", getData);
	allRadios[1].addEventListener("change", getData);

	getData();

	function getData() {
		var jahr = hgvScriptData.jahr;
		var inklSpiele = hgvScriptData.inklSpiele;
		var teams = hgvScriptData.mannschaft;


		if (jahr) {
			var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/anlaesse/?jahr=' + jahr + '&inklSpiele=' + inklSpiele + '&mannschaft=' + teams;
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
			var z = row.datum.substring(11);
			if (!row.ganzerTag) {
				row.zeit = z;
			}
			else {
				row.zeit = null;
			}
			if (row.ende) {
				row.endeDisplay = row.ende.substring(8, 10) + '.' + row.ende.substring(5, 7) + '.' + row.ende.substring(0, 4);
				var z = row.ende.substring(11);
				if (!row.ganzerTag) {
					row.endeZeit = z;
				}
				else {
					row.endeZeit = null;
				}
			}
		});
		dataList.add(results);

		dataList.sort('datum', { order: "asc" });
	}

})();

