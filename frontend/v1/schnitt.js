console.log(hgvScriptData);
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
        valueNames.push(tdElements[v].classList[0]);
    }

    var options = {
        valueNames: valueNames,
        listClass: 'hg_list',
        item: 'hg_tr_template',
        sortFunction: hgutil.sortFunction
    };
    var dataList = new List('hg_data', options);

    document.getElementById('hg_jahrSelect').addEventListener("change", getData);
    document.getElementById('hg_teamSelect').addEventListener("change", getData);
    var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

    allRadios[0].addEventListener("change", getData);
    allRadios[1].addEventListener("change", getData);

    function getData() {
        var jahr = hgvScriptData.jahr;
        var teams = hgvScriptData.mannschaft;
        var nurMeisterschaft = hgvScriptData.nurMeisterschaft;
        var alle = nurMeisterschaft;

        if (jahr && teams && teams.length > 0) {
            var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/durchschnitt/' + teams + '?alle=' + alle + '&jahr=' + jahr;
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

        //remove total rows
        var tfoot = document.getElementById('hg_data').getElementsByTagName('tfoot')[0];
        while (tfoot.firstChild) {
            tfoot.removeChild(tfoot.firstChild);
        }

        if (results.length === 0) {
            document.getElementById('hg_data').style.display = 'none';
            return;
        }
        document.getElementById('hg_data').style.display = '';

        var totalPunkte = 0;
        var totalStreiche = 0;
        var totalRp = 0;
        var totalRies = [];
        for (i = 0; i < 8; i++) {
            totalRies.push(0);
        }

        results.forEach(function (row) {
            if (row.schnitt && row.schnittVorjahr) {
                row.diff = (parseFloat(row.schnitt) - parseFloat(row.schnittVorjahr)).toFixed(2);
            }

            if (row.schnitt) {
                row.schnitt = row.schnitt.toFixed(2);
            }

            if (row.streiche) {
                totalStreiche += row.streiche;
            }

            if (row.punkte) {
                totalPunkte += row.punkte;
            }

            if (row.rangpunkte) {
                totalRp += row.rangpunkte;
            }

        });
        dataList.add(results);

        // css class 'negative' und 'positive' in der diff spalte hinzufÃ¼gen
        var i = 0;
        var diffTds = document.getElementById('hg_data').querySelectorAll('td.diff');
        for (; i < diffTds.length; i++) {
            var diffTd = diffTds[i];
            var value = parseFloat(diffTd.textContent);
            if (value >= 0) {
                diffTd.classList.add('positive');
            }
            else if (value < 0) {
                diffTd.classList.add('negative');
            }
        }

        //sortierung nach schnitt
        dataList.sort('schnitt', { order: "desc" });

        // mannschaftstotal
        if (totalStreiche > 0) {
            var totalRow = document.getElementById('hg_total_tr').cloneNode(true);
            totalRow.querySelector(".total_label").textContent = 'Mannschaftstotal';
            totalRow.querySelector(".total_punkte").textContent = totalPunkte;
            totalRow.querySelector(".total_streiche").textContent = totalStreiche;
            totalRow.querySelector(".total_schnitt").textContent = (totalPunkte / totalStreiche).toFixed(2);
            totalRow.querySelector(".total_rangpunkte").textContent = totalRp;
            tfoot.appendChild(totalRow);
        }

        // rangpunkte verstecken wenn nachwuchs
        var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
            return v.value;
        });
        if (teams.length === 1 && teams[0] === 'NW') {
            document.getElementById('hg_rangpunkte_header').style.display = 'none';
            document.getElementById('hg_rangpunkte_footer').style.display = 'none';

            var rangpunkteTds = document.getElementById('hg_data').querySelectorAll("td.rangpunkte");
            for (i = 0; i < rangpunkteTds.length; i++) {
                rangpunkteTds[i].style.display = 'none';
            }
        }
        else {
            document.getElementById('hg_rangpunkte_header').style.display = '';
            document.getElementById('hg_rangpunkte_footer').style.display = '';
        }
    }

})();