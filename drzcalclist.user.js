// ==UserScript==
// @name Zagan's Black Market Button
// @namespace http://tampermonkey.net/
// @version Custom
// @description Launches a themed trading interface for Torn
// @match https://www.torn.com/item.php*
// @downloadURL https://raw.githubusercontent.com/TornKit/drztrades/main/drzcalclist.user.js
// @updateURL https://raw.githubusercontent.com/TornKit/drztrades/main/drzcalclist.user.js
// @grant none
// ==/UserScript==

// SET YOUR API KEY HERE //
const apiKey = 'xxx';

(function () {
'use strict';

let popupWindow;
let itemValuePairs = {};
const apiUrl = `https://api.torn.com/torn/?selections=items&key=${apiKey}`;

// Fetch data from the Torn API
fetch(apiUrl)
.then(response => response.json())
.then(data => {
  if (data.items) {
    itemValuePairs = Object.entries(data.items).reduce((acc, [itemId, itemData]) => {
      acc[itemId] = itemData.market_value;
      return acc;
    }, {});
  } else {
    console.error('Error: Unable to retrieve items data from the API response.');
  }
})
.catch(error => console.error('Error fetching data from the Torn API:', error));

// Utility
function extractNumericValue(str) {
  const numericString = str.replace(/[^0-9]/g, '');
  return numericString ? parseInt(numericString, 10) : 0;
}

function updateValues() {
  const valueCells = popupWindow.document.querySelectorAll('.item-value');
  let totalValue = 0;
  const currencyOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  valueCells.forEach((cell) => {
    const quantityInput = cell.closest('tr').querySelector('.quantity-input');
    const valueEach = extractNumericValue(cell.closest('tr').querySelector('.value-each').getAttribute('data-value-each'));
    const quantity = parseInt(quantityInput.value);
    const newValue = quantity * valueEach;
    cell.textContent = newValue.toLocaleString('en-US', currencyOptions);
    totalValue += newValue;
  });

  const totalCell = popupWindow.document.querySelector('.summary-total-value');
  totalCell.textContent = totalValue.toLocaleString('en-US', currencyOptions);

  const payCell = popupWindow.document.querySelector('.drz-pays-cell');
  payCell.textContent = Math.ceil(0.93 * extractNumericValue(totalCell.textContent)).toLocaleString('en-US', currencyOptions);
}

const tradeButton = document.createElement('button');
tradeButton.textContent = 'Black Market Deal';
tradeButton.title = 'Only fools pay market price.';
Object.assign(tradeButton.style, {
  background: 'linear-gradient(to bottom, #111, #333)',
  border: '1px solid #555',
  color: '#C0F',
  fontWeight: 'bold',
  padding: '10px 20px',
  borderRadius: '4px',
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  cursor: 'pointer',
});

// Market value function
function getMarketValue(itemId) {
  return itemValuePairs[itemId] || 0;
}

// Button action
tradeButton.addEventListener('click', function () {
  if (!popupWindow || popupWindow.closed) {
    popupWindow = window.open('', 'TradePopup', 'width=900,height=600');

    const popupStyle = popupWindow.document.createElement('style');
    popupStyle.textContent = `
      body {
        background: linear-gradient(to bottom, #1a1a1a, #2a2a2a);
        font-family: 'Roboto', 'Arial', sans-serif;
        color: #ccc;
      }
      table {
        background: #222;
        border: 1px solid #444;
        border-radius: 4px;
        width: 100%;
        table-layout: fixed;
      }
      th, td {
        padding: 8px;
        text-align: center;
        border: 1px solid #333;
        font-size: 13px;
      }
      .value-each, .item-value, .drz-pays-cell {
        font-weight: bold;
        font-family: monospace;
        color: #C0F;
      }
      .summary-total-value {
        font-size: 20px;
        background: #111;
        border: 2px solid #555;
        border-radius: 4px;
        color: #FA5;
        padding: 10px;
      }
      .quantity-minus {
        background: #440000;
        color: white;
        border-radius: 4px;
      }
      .quantity-plus {
        background: #004400;
        color: white;
        border-radius: 4px;
      }
      .set-trade-button, .set-quantities-button {
        background: linear-gradient(to bottom, #2b2b2b, #444);
        border: 2px solid #000;
        color: #0f0;
        font-weight: bold;
        padding: 10px;
        margin: 20px 5px;
        border-radius: 4px;
        cursor: pointer;
        float: right;
      }
    `;
    popupWindow.document.head.appendChild(popupStyle);

    const table = popupWindow.document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Qty</th>
          <th>Item</th>
          <th>Street Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    const items = document.querySelectorAll('ul#all-items li');
    items.forEach(item => {
      const category = item.getAttribute('data-category');
      const qty = parseInt(item.getAttribute('data-qty'));
      const itemID = item.getAttribute('data-item');
      const name = item.getAttribute('data-sort');

      if (!qty || isNaN(qty) || ['Book', 'Electronic'].includes(category)) return;

      const src = item.querySelector('img')?.src || '';
      let valueEach = getMarketValue(itemID);
      const formattedValue = valueEach.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <button class="quantity-minus">-</button>
          <input class="quantity-input" type="number" min="0" max="${qty}" value="${qty}" style="width: 50px; text-align: center;">
          <button class="quantity-plus">+</button>
        </td>
        <td style="text-align:left;">
          <img src="${src}" alt="${name}" style="height:20px; vertical-align:middle; margin-right:5px;">${name}
        </td>
        <td class="value-each" data-value-each="${valueEach}">${formattedValue}</td>
        <td class="item-value">0</td>
      `;

      const input = row.querySelector('.quantity-input');
      const minus = row.querySelector('.quantity-minus');
      const plus = row.querySelector('.quantity-plus');
      const totalCell = row.querySelector('.item-value');

      function recalc() {
        const val = parseInt(input.value) || 0;
        totalCell.textContent = (val * valueEach).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
        updateValues();
      }

      input.addEventListener('change', recalc);
      minus.addEventListener('click', () => {
        if (input.value > 0) input.value--;
        recalc();
      });
      plus.addEventListener('click', () => {
        if (input.value < qty) input.value++;
        recalc();
      });

      tbody.appendChild(row);
    });

    const summaryRow = document.createElement('tr');
    summaryRow.innerHTML = `
      <td colspan="3">Total Market Value</td>
      <td class="summary-total-value">0</td>
    `;
    const payRow = document.createElement('tr');
    payRow.innerHTML = `
      <td colspan="3">Zagan's Offer (93%Street Price):</td>
      <td class="drz-pays-cell">0</td>
    `;

    table.appendChild(summaryRow);
    table.appendChild(payRow);

    popupWindow.document.body.appendChild(table);

    const tradeBtn = popupWindow.document.createElement('button');
    tradeBtn.className = 'set-trade-button';
    tradeBtn.textContent = 'Submit a Blacklist Offer';
    tradeBtn.addEventListener('click', () => {
      window.open('https://www.torn.com/trade.php#step=start&userID=2244377', '_blank');
    });

    const zeroBtn = popupWindow.document.createElement('button');
    zeroBtn.className = 'set-quantities-button';
    zeroBtn.textContent = 'Zero All Quantities';
    zeroBtn.addEventListener('click', () => {
      popupWindow.document.querySelectorAll('.quantity-input').forEach(input => input.value = 0);
      updateValues();
    });

    popupWindow.document.body.appendChild(tradeBtn);
    popupWindow.document.body.appendChild(zeroBtn);
    popupWindow.document.title = "Zagan's Black Market Button";
    updateValues();

  } else {
    popupWindow.focus();
  }
});

const targetDiv = document.querySelector('.items-wrap.primary-items.t-blue-cont');
if (targetDiv) {
  targetDiv.insertBefore(tradeButton, targetDiv.firstChild);
}
})();
