(function () {
        var ligaSelect = document.getElementById('hg_ligaSelect');
        var hgDataTable = document.getElementById("hg_data");
        var hgSearch = document.getElementById("hg_search");
        var hgLoader = document.getElementById("hg_loader");

        var valueNames = ['rang', 'name', 'vorname', 'mannschaft', 'anzahlSpiele', 'rangpunkte', 'punkte'];
        var options = {
            valueNames: valueNames,
            listClass: 'hg_list',
            item: 'hg_tr_template',
            searchColumns: ['name', 'vorname', 'mannschaft']
        };
        var dataList = new List('hg_data', options);

        function loadLiga() {
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

                    ligaSelect.addEventListener("change", loadRangliste);
                })
                .catch(function(error) {
                    console.error('Fehler beim Laden der Liga:', error);
                });
        }

        function loadRangliste() {
            var liga = ligaSelect.value;

            if (liga) {
                hgLoader.style.display = 'block';
                hgDataTable.style.display = 'none';
                hgSearch.style.display = 'none';

                var url = 'https://test.hgverwaltung.ch/api/1/live/meisterschaft-rangliste-einzelschlaeger/' + liga;
                fetch(url)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(results) {
                        showData(results);
                    })
                    .catch(function(error) {
                        console.error('Fehler beim Laden der Rangliste:', error);
                    })
                    .finally(function() {
                        hgLoader.style.display = 'none';
                    });
            } else {
                showData([]);
            }
        }

        function showData(results) {
            dataList.clear();
            if (results.length === 0) {
                hgDataTable.style.display = 'none';
                hgSearch.style.display = 'none';
                return;
            }
            hgDataTable.style.display = '';
            hgSearch.style.display = '';
            dataList.add(results);
            dataList.sort('rang', { order: "asc" });
        }

        hgSearch.addEventListener('keyup', function() {
            dataList.search(this.value);
        });

        loadLiga();
    })();

