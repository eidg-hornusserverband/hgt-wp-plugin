(function () {

		var club = hgvScriptData.hgv_code;
		if (!club) {
			club = 'test';
		}
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/spiele/jahre', 'hg_jahrSelect', true, getData);
		hgutil.loadSelectFromArray('https://www.hgverwaltung.ch/api/1/' + club + '/mannschaften?spiele=true', 'hg_teamSelect', true, getData);

		document.getElementById('hg_jahrSelect').addEventListener("change", getData);
		document.getElementById('hg_teamSelect').addEventListener("change", getData);

		var allRadios = document.getElementById('hg_alle').querySelectorAll("input");
		allRadios[0].addEventListener("change", getData);
		allRadios[1].addEventListener("change", getData);

		var gegnerRadios = document.getElementById('hg_gegner').querySelectorAll("input");
		gegnerRadios[0].addEventListener("change", getData);
		gegnerRadios[1].addEventListener("change", getData);

		var draw = SVG('drawing').size(500, 740);
		//draw.scale(0.9, 0.9);
		function getData() {
			var jahr = document.getElementById('hg_jahrSelect').value;
			var teams = Array.prototype.slice.call(document.querySelectorAll('#hg_teamSelect option:checked'), 0).map(function (v) {
				return v.value;
			});
			var alle = document.querySelector('#hg_alle input[name="alle"]:checked').value;
			var gegner = document.querySelector('#hg_gegner input[name="gegner"]:checked').value;

			if (jahr && teams && teams.length > 0) {
				var url = 'https://www.hgverwaltung.ch/api/1/' + club + '/nummer/' + teams.join(',').replace(/\//g,'--') + '?alle=' + alle + '&jahr=' + jahr + '&gegner=' + gegner;
				fetch(url).then(function (response) {
					return response.json();
				}).then(function (results) {
					showData(results);
				});
			}
			else {
				showData({nummern: [], total: []});
			}
		}

		function showData(data) {
			var nrs = data.nummern;
			var totals = data.total;

			var tn = document.getElementById('totalNummern');
			tn.innerText = '';
			draw.clear();
			if (nrs === null || nrs.length === 0) {
				return;
			}

			var total = nrs.reduce(function(acc, cv) {
				return acc + cv;
			});
			tn.innerText = total;

			var i = 0;

            var leftMargin = 25;
			var xStart = leftMargin;
			var xEnd = xStart + 366;
			var y = 0;
			var height = 35;
			var colors = [];
			var noOfFields = 21;

			for (i = 0; i < noOfFields; i++) {
				if (nrs[i] === 0) {
					colors.push('none');
				}
				else if (nrs[i] < 5) {
					colors.push('LightSalmon');
				}
				else if (nrs[i] < 10) {
					colors.push('DarkSalmon');
				}
				else if (nrs[i] < 15) {
					colors.push('IndianRed');
				}
				else {
					colors.push('Crimson');
				}
			}

			for (i = 0; i < noOfFields; i++) {
				//           oben links,    oben rechts, unten rechts,     unten links         oben links
				var edges = [xStart, 0 + y, xEnd, 0 + y, xEnd - 4, height + y, xStart + 4, height + y, xStart, 0 + y];

				draw.polyline(edges).fill(colors[noOfFields - (i + 1)]).stroke({ width: 1 });
				draw.text("" + (noOfFields - i)).move((noOfFields - i) < 10 ? xStart - 15 : xStart - 25, 10 + y);
				draw.text("" + (noOfFields - i)).move((noOfFields - i) < 10 ? xEnd + 7 : xEnd + 7, 10 + y);

				var r = nrs[noOfFields - (i + 1)];
				if (r > 0) {
					draw.text("" + r).move(r < 10 ? leftMargin + 178 : leftMargin + 173, 5 + y).font('weight', 'bold').font({ size: 18 });
				}

				var t = totals[noOfFields - (i + 1)];
				if (t > 0) {
					var tx;
					if (t < 10) {
                       tx = leftMargin + 226;
					}
					else if (t < 100) {
                       tx = leftMargin + 218;
					}
					else {
                       tx = leftMargin + 210;
					}					
					draw.text("" + t).move(tx, 7 + y).font('weight', 'normal').font({ size: 16 }).fill({ color: '#3c3c3c' });					
				}

				xStart = xStart + 4;
				xEnd = xEnd - 4;
				y = y + height;
			}
		}
	})();

