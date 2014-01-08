/**
 * Created with JetBrains PhpStorm.
 * User: jeremy
 * Date: 7/22/12
 * Time: 11:57 AM
 */
(function($){
	"use strict";
	var APP = {};

	APP.core = function() {
		var currentDate = '',
			currentRate = '',

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

			setCurrentRate = function (xml) {
				if (!xml) {
					console.log('empty xml. Fail.');
					return;
				}
				var usd = $(xml).find('Valute[ID="R01235"] Value').html(),
					rate = usd.replace(',', '.');
				currentRate = rate;
				localStorage.setItem('rate', rate);
				localStorage.setItem('date', currentDate);
				insertPrice();
			},

			ajax = function (url) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						setCurrentRate(xhr.responseText);
					}
				};
				xhr.send();
			},

			updatePrice = function () {
				$('.rubles').remove();
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

			lastUpdate = new Date().getTime(),

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
			};

		return {
			init: init,
			update : update
		};
	}();

	$(document).ready(function() {
		setTimeout(function () {
			APP.core.init();
		}, 700);
		setTimeout( function () {
			document.addEventListener("DOMSubtreeModified", function(event){
				APP.core.update();
			});
		},10000);

	});

})($);





