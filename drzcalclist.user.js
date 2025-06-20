// ==UserScript==
// @name Dr. Z's Super Trade Button
// @namespace http://tampermonkey.net/
// @version 1.2
// @description Opens the best trading interface ever
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
// Extract key-value pairs from the API response
itemValuePairs = Object.entries(data.items)
.reduce((accumulator, [itemId, itemData]) => {
accumulator[itemId] = itemData.market_value;
return accumulator;
}, {});
} else {
console.error('Error: Unable to retrieve items data from the API response.');
}
})
.catch(error => console.error('Error fetching data from the Torn API:', error));

// Function to extract the numeric value from a string
function extractNumericValue(str) {
const numericString = str.replace(/[^0-9]/g, ''); // Remove non-numeric characters
return numericString ? parseInt(numericString, 10) : 0;
}

// Function to update the summary row, total value, and Dr. Z pays
function updateValues() {
const valueCells = popupWindow.document.querySelectorAll('.item-value');
let totalValue = 0;

const currencyOptions = {
style: 'currency',
currency: 'USD',
minimumFractionDigits: 0,
maximumFractionDigits: 0,
};

valueCells.forEach((valueCell) => {
const quantityInput = valueCell.closest('tr').querySelector('.quantity-input');
const valueEach = extractNumericValue(valueCell.closest('tr').querySelector('.value-each').getAttribute('data-value-each'));
const quantity = parseInt(quantityInput.value);
const newValue = quantity * valueEach;
valueCell.textContent = newValue.toLocaleString('en-US', currencyOptions);
totalValue += newValue;
});

const totalValueCell = popupWindow.document.querySelector('.summary-total-value');
totalValueCell.textContent = totalValue.toLocaleString('en-US', currencyOptions);

const drzPaysCell = popupWindow.document.querySelector('.drz-pays-cell');
drzPaysCell.textContent = Math.ceil(0.93 * extractNumericValue(totalValueCell.textContent)).toLocaleString('en-US', currencyOptions);
}

// Create a button element for "Trade w/ Dr. Z"
const tradeButton = document.createElement('button');
tradeButton.textContent = 'Trade w/ Dr. Z';
tradeButton.style.background = 'linear-gradient(to bottom, #FF0000, #CC0000)';
tradeButton.style.border = '1px solid #CC0000';
tradeButton.style.color = 'white';
tradeButton.style.fontWeight = 'bold';
tradeButton.style.padding = '10px 20px';
tradeButton.style.borderRadius = '4px';
tradeButton.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.4)';
tradeButton.style.cursor = 'pointer';

// Create a button element for "Set Quantities to Zero"
const setQuantitiesButton = document.createElement('button');
setQuantitiesButton.textContent = 'Set Quantities to Zero';
setQuantitiesButton.style.background = 'linear-gradient(to bottom, #FF0000, #CC0000)';
setQuantitiesButton.style.border = '1px solid #CC0000';
setQuantitiesButton.style.color = 'white';
setQuantitiesButton.style.fontWeight = 'bold';
setQuantitiesButton.style.padding = '10px 20px';
setQuantitiesButton.style.borderRadius = '4px';
setQuantitiesButton.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.4)';
setQuantitiesButton.style.cursor = 'pointer';

// Add a click event listener to the "Set Quantities to Zero" button
setQuantitiesButton.addEventListener('click', function () {
// Set all quantity inputs to zero and update values
const quantityInputs = popupWindow.document.querySelectorAll('.quantity-input');
quantityInputs.forEach((quantityInput) => {
quantityInput.value = 0;
});

// Update values after setting quantities to zero
updateValues();
});

function getMarketValue(itemId) {
return itemValuePairs[itemId] || 0;
}

// Add a click event listener to the "Trade w/ Dr. Z" button
tradeButton.addEventListener('click', function () {
if (!popupWindow || popupWindow.closed) {
// Open a new popup window
popupWindow = window.open('', 'TradePopup', 'width=900,height=600');

// Add CSS styles to the popup window
const popupStyle = popupWindow.document.createElement('style');
popupStyle.textContent = `
body {
background: linear-gradient(to bottom, #ff99ff, #99ccff, #66ff99);
font-family: 'Comic Sans MS', cursive, sans-serif;
}
table {
background: #f2f2f2;
border: 2px solid #f5c542;
border-radius: 4px;
}
th, td {
padding: 10px;
text-align: center;
word-wrap: break-word;
}
.quantity-minus, .quantity-plus {
border-radius: 50%;
width: 30px;
height: 30px;
font-size: 20px;
margin: 0 5px;
}
.value-each, .item-value, .drz-pays-cell {
font-weight: bold;
font-family: 'Comic Sans MS', cursive, sans-serif;
}
.summary-total-value {
font-size: 24px;
background: linear-gradient(to bottom, #ffff66, #ff9900);
border: 2px solid #ff6600;
border-radius: 4px;
color: #fff;
padding: 10px;
}
.summary-total-value:before, .drz-pays-cell:before {
content: '';
}
button {
cursor: pointer;
}
.quantity-minus {
background: linear-gradient(to bottom, #FF0000, #CC0000);
color: white;
}
.quantity-plus {
background: linear-gradient(to bottom, #00FF00, #00CC00);
color: white;
}
.set-trade-button {
background: linear-gradient(to bottom, #FF00FF, #00FFFF); /* Gumballs and Glitter Theme */
border: 2px solid #000;
color: yellow; /* Lemon Yellow */
font-family: 'Indie Flower', cursive;
font-size: 18px;
padding: 20px 0;
margin: 20px 0;
border-radius: 0 0 4px 4px;
box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
cursor: pointer;
float: right;
}
`;
popupWindow.document.head.appendChild(popupStyle);

// Create a table for the popup
const table = popupWindow.document.createElement('table');
table.style.borderCollapse = 'collapse';
table.style.width = '100%';
table.style.border = '2px solid #ccc';
table.style.tableLayout = 'fixed'; // Ensures all content is visible
table.innerHTML = `
<thead>
<tr>
<th style="width: 25%; border: 2px solid #000;">Quantity</th>
<th style="width: 30%; border: 2px solid #000;">Item</th>
<th style="width: 20%; border: 2px solid #000;">Value Each</th>
<th style="width: 25%; border: 2px solid #000;">Total Value</th>
</tr>
</thead>
<tbody>
`;

// Create a tbody element to hold the item rows
const tbody = popupWindow.document.createElement('tbody');

// Find and iterate through relevant <li> elements
const itemElements = document.querySelectorAll('ul#all-items li');
itemElements.forEach(itemElement => {
const category = itemElement.getAttribute('data-category');
const datasort = itemElement.getAttribute('data-sort');
const quantity = itemElement.getAttribute('data-qty');
const itemID = itemElement.getAttribute('data-item');

if (['Book', 'Primary', 'Secondary', 'Melee', 'Defensive', 'Electronic'].includes(category) ||
parseInt(quantity) === 0 ||
isNaN(parseInt(quantity)) ||
datasort.match(/^Halloween Basket.*$/) ||
{
return; // Skip items with undesired categories
}

const itemImageSrc = itemElement.querySelector('div.title-wrap div span.image-wrap img')?.getAttribute('src') || '';
const itemName = itemElement.getAttribute('data-sort');

const currencyOptions = {
style: 'currency',
currency: 'USD',
minimumFractionDigits: 0,
maximumFractionDigits: 0,
};

//let valueEach = extractNumericValue(itemElement.querySelector('span.tt-item-price span') ? itemElement.querySelector('span.tt-item-price span').textContent : '0');
let valueEach = getMarketValue(itemID);
valueEach = valueEach.toLocaleString('en-US', currencyOptions);
const itemRow = popupWindow.document.createElement('tr');
itemRow.style.border = '1px solid #000';
itemRow.innerHTML = `
<td style="border: 1px solid #000; text-align: center;">
<button class="quantity-minus" style="background: linear-gradient(to bottom, #FF0000, #CC0000); color: white; border: none;">-</button>
<input class="quantity-input" placeholder="0" type="number" min="0" max="${quantity}" value="${quantity}" style="border: 1px solid #000; text-align: center; width: 50px; display: inline-block; padding: 3px;">
<button class="quantity-plus" style="background: linear-gradient(to bottom, #00FF00, #00CC00); color: white; border: none;">+</button>
</td>
<td style="border: 1px solid #000; white-space: nowrap; max-width: 100%; text-align: left;"><div style="display: flex;">
<img src="${itemImageSrc}" alt="${itemName}" style="vertical-align: middle; margin-right: 5px;" /></div> ${itemName}
</td>
<td class="value-each" data-value-each="${valueEach}" style="border: 1px solid #000; text-align: right;">${valueEach}</td>
<td class="item-value" style="border: 1px solid #000; text-align: right;">${quantity * valueEach}</td>
`;

const quantityInput = itemRow.querySelector('.quantity-input');
const quantityMinusButton = itemRow.querySelector('.quantity-minus');
const quantityPlusButton = itemRow.querySelector('.quantity-plus');
const itemValueCell = itemRow.querySelector('.item-value');

quantityInput.addEventListener('focusout', () => {
let newQuantity = parseInt(quantityInput.value);
if (isNaN(newQuantity)) { quantityInput.value = 0; }
else if (newQuantity >= quantity) {
quantityInput.value = quantity;
}
else if (newQuantity <= 0) {
quantityInput.value = 0;
}
else quantityInput.value = newQuantity;
itemValueCell.textContent = quantityInput.value * valueEach;
updateValues(itemRow, summaryRow, drzPaysRow);
});

quantityInput.addEventListener('click', () => {
let newQuantity = parseInt(quantityInput.value);
if (isNaN(newQuantity)) { quantityInput.value = 0; }
else if (newQuantity >= quantity) {
quantityInput.value = quantity;
}
else if (newQuantity <= 0) {
quantityInput.value = 0;
}
else quantityInput.value = newQuantity;
itemValueCell.textContent = quantityInput.value * valueEach;
updateValues(itemRow, summaryRow, drzPaysRow);
});

quantityMinusButton.addEventListener('click', () => {
let newQuantity = parseInt(quantityInput.value) - 1;
if (newQuantity >= 0) {
quantityInput.value = newQuantity;
itemValueCell.textContent = newQuantity * valueEach;
updateValues(itemRow, summaryRow, drzPaysRow);
}
});

quantityPlusButton.addEventListener('click', () => {
let newQuantity = parseInt(quantityInput.value) + 1;
if (newQuantity <= quantity) {
quantityInput.value = newQuantity;
itemValueCell.textContent = newQuantity * valueEach;
updateValues(itemRow, summaryRow, drzPaysRow);
}
});

tbody.appendChild(itemRow);
});

// Create a summary row
const summaryRow = popupWindow.document.createElement('tr');
summaryRow.style.border = '1px solid #000';
summaryRow.innerHTML = `
<td colspan="3" style="border: 2px solid #000; text-align: right; font-weight: bold;">Total Market Value of All Items</td>
<td class="summary-total-value" style="border: 2px solid #000; text-align: right;">0</td>
`;

// Create a Dr. Z Pays row
const drzPaysRow = popupWindow.document.createElement('tr');
drzPaysRow.style.border = '1px solid #000';
drzPaysRow.innerHTML = `
<td colspan="3" style="border: 2px solid #000; text-align: right; font-weight: bold;">Dr. Z pays 93%:</td>
<td class="drz-pays-cell" style="border: 2px solid #000; text-align: right;">0</td>
`;

// Append the table to the popup window's document
table.appendChild(tbody);
table.appendChild(summaryRow);
table.appendChild(drzPaysRow);

popupWindow.document.title = 'Trade with Dr. Z';
popupWindow.document.body.appendChild(table);

// Create a button element for "Set Trade Now!"
const setTradeButton = popupWindow.document.createElement('button');
setTradeButton.textContent = 'Set Trade Now!';
setTradeButton.style.background = 'linear-gradient(to bottom, #800080, #8B008B)'; // Royal Purple
setTradeButton.style.border = '2px solid #000';
setTradeButton.style.color = 'yellow'; // Lemon Yellow
setTradeButton.style.fontWeight = 'bold';
setTradeButton.style.padding = '20px 0'; // Add top padding
setTradeButton.style.margin = '20px 0';
setTradeButton.style.borderRadius = '0 0 4px 4px'; // Preserve the rounded corners
setTradeButton.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.4)';
setTradeButton.style.cursor = 'pointer';
setTradeButton.style.float = 'right';

// Add a click event listener to the "Set Trade Now!" button
setTradeButton.addEventListener('click', function () {
// Open the trade page in a new tab
window.open('https://www.torn.com/trade.php#step=start&userID=2871443', '_blank');
});
updateValues();

// Create a button element for "Set Quantities to Zero"
const setQuantitiesButton = popupWindow.document.createElement('button');
setQuantitiesButton.textContent = 'Set Quantities to Zero';
setQuantitiesButton.style.background = 'linear-gradient(to bottom, #FF0000, #CC0000)';
setQuantitiesButton.style.border = '2px solid #000';
setQuantitiesButton.style.color = 'white';
setQuantitiesButton.style.fontWeight = 'bold';
setQuantitiesButton.style.padding = '20px 0'; // Add top padding
setQuantitiesButton.style.margin = '20px 0';
setQuantitiesButton.style.borderRadius = '0 0 4px 4px'; // Preserve the rounded corners
setQuantitiesButton.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.4)';
setQuantitiesButton.style.cursor = 'pointer';
setQuantitiesButton.style.float = 'right';

// Add a click event listener to the "Set Quantities to Zero" button
setQuantitiesButton.addEventListener('click', function () {
// Set all quantity inputs to zero and update values
const quantityInputs = popupWindow.document.querySelectorAll('.quantity-input');
quantityInputs.forEach((quantityInput) => {
quantityInput.value = 0;
});

// Update values after setting quantities to zero
updateValues();
});

// Append the "Set Trade Now!" button and the offer row to the popup window's document
popupWindow.document.body.appendChild(setTradeButton);
popupWindow.document.body.appendChild(setQuantitiesButton);

} else {
// If the popup is already open, give it focus
popupWindow.focus();
}
});

// Find the target div element with the specified class
const targetDiv = document.querySelector('.items-wrap.primary-items.t-blue-cont');

// Insert the "Trade w/ Dr. Z" button just before the target div
if (targetDiv) {
targetDiv.insertBefore(tradeButton, targetDiv.firstChild);
}
})();
