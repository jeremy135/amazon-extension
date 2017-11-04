/**
 * Created with JetBrains PhpStorm.
 * User: jeremy
 * Date: 7/22/12
 * Time: 11:57 AM
 */
(function(window, document) {
  "use strict";
  let APP = {};

  APP.core = function() {
    let currentDate = '',
      currentRate = '',


      /**
       * Массив селекторов по которым ищем цены
       */
      $priceSelectors = [
        '.a-size-mini.olpMessageWrapper',
        '.sx-price',
        '.a-size-base.a-color-base',
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
        '.offer-price',
        '.a-size-mini'
      ].join(','),


      /**
       * Приводим цифры к формату денег вида 100 000.00
       */
      moneyFormat = function(num) {
          var strNum = '' + parseFloat(num).toFixed(2),
              parts = strNum.split('.'),
              head = parts[0] || '',
              tail = parts[1] || '',
              s = [];
          if (head) {
            var l = head.length,
                p = Math.floor(l / 3);
            for (let i = 0; i < p; i++) {
              s.push(head.substr(l - (i * 3) - 3, 3));
            }
            s.push(head.substr(0, (l % 3)));
            s.reverse();
          }
          if (s.length > 0) {
            return s.join(' ') + '.' + tail;
          } else {
            return num;
          }
      },


      /**
       * Находим цены и вставляем рублевый эквивалент
       */
      insertPrice = function () {
        document.querySelectorAll($priceSelectors).forEach(function(item) {
         const re = /(\d)\s+(?=\d)/g;
         const price = parseFloat(item.innerText.replace('$', '').replace(',','').replace(re, '$1.'));
         const newPrice = Math.round(price * currentRate);
          if (!isNaN(newPrice)) {
            item.innerHTML += `<span class="jd-rubles">( ${moneyFormat(newPrice)} руб.)</div>`;
          }

        });
      },


      /**
       * Получаем курс валюты и запоминаем его в localStorage
       */
      setCurrentRate = function (xml) {
        if (!xml) {
          console.log('empty xml. Fail.');
          return;
        }
        var usd = $(xml).find('Valute[ID="R01235"] Value').html(),
          rate = usd.replace(',', '.');
        currentRate = rate;
        localStorage.setItem('jd-rate', rate);
        localStorage.setItem('jd-date', currentDate);
        insertPrice();
      },


      /**
       * Обертка ajax get запроса
       */
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


      /**
       * Удаляем старые цены, встваляем новые
       */
      updatePrice = function () {
        document.querySelectorAll('.jd-rubles').forEach(function(item) {
          const parent = item.parentNode;
          parent.removeChild(item);
        });
        insertPrice();
      },


      /**
       * Запускаем обновление цен, не чаще чем раз в 2 секунды
       */
      update = function () {
        var now = new Date().getTime();
        if (lastUpdate + 2000 < now) {
          setTimeout(function () {
            updatePrice();
          }, 2500);
          lastUpdate = now;
        }
      },


      /**
       * Дата последнего обновления
       */
      lastUpdate = new Date().getTime(),


      /**
       * Запускаем вставку цен в рублях
       */
      init = function() {
        var today = new Date(),
          d = today.getDate(),
          m = today.getMonth()+ 1,
          y = today.getFullYear();
        currentDate = d + '-' + m + '-' + y;
        if (window.localStorage.getItem('jd-date') !== currentDate) {
          var cUrl = "https://www.cbr.ru/scripts/XML_daily.asp";
          ajax(cUrl);
        } else {
          currentRate = window.localStorage.getItem('jd-rate');
          insertPrice();
        }
      };

    return {
      init: init,
      update : update
    };
  }();


  /**
   * Запускаем приложение и подписываемся на обновления дома
   */
  function runApp() {
    setTimeout(function () {
      APP.core.init();
    }, 700);
    setTimeout(function () {
      document.addEventListener('DOMSubtreeModified', function(event){
        APP.core.update();
      });
    }, 10000);
  }


  /**
   * Ждем разрузки страницы, для запуска приложения
   */
  function waitLoading() {
    document.onreadystatechange = function () {
      if (document.readyState === 'interactive') {
        runApp();
      }
    }
  }


  /**
   * Анализируем состояние страницы
   */
  switch(document.readyState) {
    case 'loading':
      waitLoading();
      break;
    case 'interactive':
    case 'complete':
      runApp()
      break;
  }

})(window, window.document);

