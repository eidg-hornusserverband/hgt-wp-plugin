(function () {
    var club = hgvScriptData.hgv_code;
    if (!club) {
        club = 'test';
    }

    hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre?alle=1', 'hg_jahrSelect', (new Date()).getFullYear(), getData);
    hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

    var hgDataTable = document.getElementById("hg_data");
    // var tbody = hgDataTable.createTBody();
    // tbody.classList.add('hg_list');
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
        });
        dataList.add(results);

        dataList.sort('datum', { order: "asc" });
    }

})();