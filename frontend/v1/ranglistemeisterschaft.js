(function () {
        var ligaSelect = document.getElementById('hg_ligaSelect');
        var gruppeSelect = document.getElementById('hg_gruppeSelect');
        var hgDataTable = document.getElementById("hg_data");

        var valueNames = ['rang', 'mannschaft', 'anzahlSpiele', 'rangpunkte', 'punkte'];
        var options = {
            valueNames: valueNames,
            listClass: 'hg_list',
            item: 'hg_tr_template'
        };
        var dataList = new List('hg_data', options);

        function loadLigaGruppe() {
            fetch('https://hgverwaltung.ch/api/1/live/meisterschaft/liga')
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    ligaSelect.innerHTML = '<option value="">Liga auswählen...</option>';
                    var ligas = [...new Set(data.map(item => item.liga))];
                    ligas.forEach(function(liga) {
                        var option = document.createElement('option');
                        option.value = liga;
                        option.textContent = liga;
                        ligaSelect.appendChild(option);
                    });

                    ligaSelect.addEventListener("change", updateGruppe);
                    gruppeSelect.addEventListener("change", loadRangliste);
                })
                .catch(function(error) {
                    console.error('Fehler beim Laden der Liga/Gruppe:', error);
                });
        }

        function updateGruppe() {
            var selectedLiga = ligaSelect.value;
            gruppeSelect.innerHTML = '<option value="">Gruppe auswählen</option>';

            if (selectedLiga) {
                fetch('https://hgverwaltung.ch/api/1/live/meisterschaft/liga')
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        var gruppen = data.filter(function(item) {
                            return item.liga === selectedLiga;
                        }).map(function(item) {
                            return item.gruppe;
                        });

                        gruppen.forEach(function(gruppe) {
                            var option = document.createElement('option');
                            option.value = gruppe;
                            option.textContent = gruppe;
                            gruppeSelect.appendChild(option);
                        });
                        
                        if (gruppen.length === 1) {
                            gruppeSelect.value = gruppen[0];
                            loadRangliste();
                        }
                    })
                    .catch(function(error) {
                        console.error('Fehler beim Aktualisieren der Gruppen:', error);
                    });
            }
        }

        function loadRangliste() {
            var liga = ligaSelect.value;
            var gruppe = gruppeSelect.value;

            if (liga && gruppe) {
                var url = 'https://hgverwaltung.ch/api/1/live/meisterschaft-rangliste-mannschaft/' + liga + '/' + gruppe;
                fetch(url)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(results) {
                        showData(results);
                    })
                    .catch(function(error) {
                        console.error('Fehler beim Laden der Rangliste:', error);
                    });
            } else {
                showData([]);
            }
        }

        function showData(results) {
            dataList.clear();
            if (results.length === 0) {
                hgDataTable.style.display = 'none';
                return;
            }
            hgDataTable.style.display = '';
            dataList.add(results);
            dataList.sort('rang', { order: "asc" });
        }

        loadLigaGruppe();
    })();

