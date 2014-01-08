/**
 * Created with JetBrains PhpStorm.
 * User: jeremy
 * Date: 7/22/12
 * Time: 11:57 AM
 */
$(document).ready(function() {
	"use strict";
	setTimeout(function () {
		APP.core.init();
	}, 700);
	setTimeout( function () {
		document.addEventListener("DOMSubtreeModified", function(event){
			APP.core.update();
		});
	},10000);

});

var APP = {};

APP.core = function() {
	'use strict';
	var currentDate = '',
		currentRate = '',
		init = function() {
			var today = new Date(),
				d = today.getDate(),
				m = today.getMonth()+ 1,
				y = today.getFullYear();
			currentDate = d + '-' + m + '-' + y;
			if (localStorage.getItem('date') !== currentDate) {
				var cUrl = "http://www.cbr.ru/scripts/XML_daily.asp";
				ajax(cUrl);
			} else {
				currentRate = localStorage.getItem('rate');
				insertPrice();
			}
		},

		setCurrentRate = function (xml) {
			if (!xml) {
				console.log('empty xml. Fail.');
				return;
			}
			var rub = $(xml).find('Valute[ID="RUB"] Value').html(),
				usd = $(xml).find('Valute[ID="R01235"] Value').html(),
				rate = usd.replace(',', '.');
			currentRate = rate;
			localStorage.setItem('rate', rate);
			localStorage.setItem('date', currentDate);
			insertPrice();
		},

		update = function () {
			var now = new Date().getTime();
			if (lastUpdate + 2000 < now) {
				setTimeout(function () {
					updatePrice();
				}, 2500);
				lastUpdate = now;
			}
		},

		updatePrice = function () {
			$('.rubles').remove();
			insertPrice();
		},

		lastUpdate = new Date().getTime(),

		$priceSelectors = [
			'.priceLarge',
			'.price',
			'.ourprice',
			'.s9Price',
			'.bld.lrg.red',
			'.pa_priceTest',
			'.hlb-price',
			'.a-color-price',
			'#price td.a-span12',
			'.listprice',
			'.offer-price'
		].join(','),

		insertPrice = function () {
			$($priceSelectors).each(function () {
				var price = parseFloat($(this).text().replace('$', "").replace(",","")),
					newPrice = Math.round(price * currentRate);
				if (!isNaN(newPrice)) {
					this.innerHTML += '<span class="rubles">( ' + newPrice + ' руб.)</div>';
				}
			});
		},

		ajax = function (url) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					setCurrentRate(xhr.responseText);
				}
			};
			xhr.send();
		};

	return {
		init: init,
		update : update
	};
}();

