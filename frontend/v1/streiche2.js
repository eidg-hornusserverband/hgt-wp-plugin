(function () {
        var club = hgvScriptData.hgv_code;
        if (!club) {
            club = 'test';
        }
        hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
        hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

        var hgDataTable = document.getElementById("hg_data");
        hgDataTable.createTFoot();

        document.getElementById('hg_jahrSelect').addEventListener("change", getData);
        document.getElementById('hg_teamSelect').addEventListener("change", getData);

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
        var allRadios = document.getElementById('hg_alle').querySelectorAll("input");

        allRadios[0].addEventListener("change", getData);
        allRadios[1].addEventListener("change", getData);

        function getData() {
            var jahr = document.getElementById('hg_jahrSelect').value;
            var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
                return v.value;
            });
            var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;

            if (jahr && teams && teams.length > 0) {
                var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/durchschnitt/' + teams.join(',').replace(/\//g, '--') + '?alle=' + alle + '&streicheDetail=true&jahr=' + jahr;
                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (results) {
                    var i = 0;
                    for (var res of results) {
                        res.id = i;
                        i++;
                    }
                    showData(results);
                });
            } else {
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

            var totals = [];
            for (j = 0; j < 31; j++) {
                totals.push(0);
            }

            results.forEach(function (row) {
                for (var s = 0; s < 31; s++) {
                    if (row.streicheDetail) {
                        var sd = row.streicheDetail[s];
                        if (sd !== 0) {
                            row['s' + s] = sd;
                            totals[s] += sd;
                        }
                    }
                }
            });
            dataList.add(results);

            //sortierung nach punkte
            dataList.sort('punkte', {order: "desc"});

            // total
            var totalRow = document.getElementById('hg_total_tr').cloneNode(true);
            totalRow.querySelector(".total_label").textContent = 'Total';
            for (i = 0; i < totals.length; i++) {
                totalRow.querySelector(".total_s" + i).textContent = totals[i];
            }
            tfoot.appendChild(totalRow);


            addClicklistener('nachname');
            addClicklistener('vorname');

        }

        function addClicklistener(field) {
            var names = document.getElementsByClassName(field);
            var n = 0;
            for (; n < names.length; n++) {
                (function () {
                    var row = n;
                    if (dataList.items[row]) {
                        var id = dataList.items[row]._values.id;
                        names[n].addEventListener('click', function () {
                            onSpielerClick(id)
                        }, false);
                    }
                })();
            }
        }

        function onSpielerClick(id) {
            showDiagram(dataList.get("id", id)[0]._values);
        }

        function showDiagram(result) {
            var modal = new tingle.modal({
                footer: false,
                stickyFooter: false,
                closeMethods: ['overlay', 'button', 'escape'],
                closeLabel: "Schliessen",
            });
            var rnd = (Math.random() + 1).toString(36).substring(7);
            modal.setContent(createDiagramHtml(result, rnd));
            modal.open();
            drawChart(result, rnd);
        }

        function drawChart(results, rnd) {
            var data = results.streicheDetail;
            var labels = [];
            var i;

            for (i = 0; i <= 30; i++) {
                labels.push(i);
            }

            var ctx = document.getElementById(rnd).getContext("2d");
            this.myChart = new Chart(ctx, {
                type: 'bar',
                width: 200,
                height: 200,
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: '#AAAAAA'
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: results.nachname + ' ' + results.vorname,
                        fontSize: 14
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Punkte'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Anzahl'
                            },
                            ticks: {
                                min: 0,
                                suggestedMax: 30,
                                stepSize: 5
                            }
                        }]
                    }
                }
            });
        }

        function createDiagramHtml(result, rnd) {
            var html = [];

            html.push('<div id="chart-container" style="position: relative; width:100%">');
            html.push('<canvas id="'+rnd+'"></canvas>');
            html.push('</div>');

            return html.join('');
        }

    })();

