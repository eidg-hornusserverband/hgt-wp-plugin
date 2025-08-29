(function () {
	var club = hgvScriptData.hgv_code;
	if (!club) {
		club = 'test';
	}
	var mannschaft = hgvScriptData.mannschaft;

	hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=null&mannschaft=' + mannschaft, 'hg_teamSelect', true, getData);

	var template = [];
	template.push('<div class="rowSpieler">');
	template.push(' <img class="foto" src="">');
	template.push(' <div class="info">');
	template.push('   <h6><span class="nachname"></span>&nbsp;<span class="vorname"></span>&nbsp;<span class="jahrgang"></span></h6>');
	template.push('   <div class="detail">');
	template.push('     <div class="col">');
	template.push('        <span class="coldetail" style="width: 200px;">Position:</span><br><b class="position"></b>');
	template.push('        <br>');
	template.push('        <span class="coldetail" style="width: 200px;">Funktionen:</span><br><b class="funktionen"></b>');
	template.push('     </div>');
	template.push('     <div class="col">');
	template.push('        <span class="coldetail" style="width: 90px;">Ehrenmitglied:</span><br><b class="ehrenmitglied"></b>');
	template.push('        <br>');
	template.push('        <span class="coldetail" style="width: 90px;">Vorstand:</span><br><b class="vorstand"></b>');
	template.push('        <br>');
	template.push('        <span class="coldetail" style="width: 90px;">Schiedsrichter:</span><br><b class="schiedsrichter"></b>');
	template.push('     </div>');
	template.push('     <div class="col">');
	template.push('        <span class="coldetail" style="width: 90px;">Fremdspieler:</span><br><b class="fremdspieler"></b>');
	template.push('        <br>');
	template.push('        <span class="coldetail" style="width: 90px;">Aufgestellt:</span><br><b class="aufgestellt"></b>');
	template.push('     </div>');
	template.push('   </div>');
	template.push(' </div>');
	template.push('</div>');
	var options = {
		valueNames: ['nachname', 'vorname', 'jahrgang', 'position', 'funktionen',
			'ehrenmitglied', 'vorstand', 'schiedsrichter', 'fremdspieler', 'aufgestellt',
			{ attr: 'src', name: 'foto' }],
		item: template.join('')
	};

	var dataList = new List('spielerListe', options);

	document.getElementById('hg_teamSelect').addEventListener("change", getData);

	function getData() {
		var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
			return v.value;
		});

		if (teams && teams.length > 0) {
			var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/spieler?inklDetail=true&aufgestellteSpieler=false&mannschaft=' + mannschaft;
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
			document.getElementById('spielerListe').style.display = 'none';
			return;
		}
		document.getElementById('spielerListe').style.display = '';

		results.forEach(function (row) {
			if (row.funktionen) {
				row.funktionen = row.funktionen.replace(/, /g, '<br>');
			}

			if (row.foto) {
				row.foto = 'https://www.hgverwaltung.ch/api/1/' + club + '/spielerfoto/' + row.foto;
			}
			else {
				row.foto = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
			}

			if (row.jahrgang) {
				row.jahrgang = '(' + row.jahrgang + ')';
			}


			if (row.ehrenmitglied) {
				row.ehrenmitglied = 'JA';
			}

			if (row.vorstand) {
				row.vorstand = 'JA';
			}

			if (row.schiedsrichter) {
				row.schiedsrichter = 'JA';
			}

			if (row.fremdspieler) {
				row.fremdspieler = 'JA';
			}

			if (row.aufgestellt) {
				row.aufgestellt = 'JA';
			}

		});

		dataList.add(results);
		dataList.sort('nachname', { order: "asc" });
	}

})();
