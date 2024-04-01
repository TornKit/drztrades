// ==UserScript==
// @name Dr. Z's Pretty Receipts
// @namespace http://tampermonkey.net/
// @version 1.0
// @description Creates receipts in HTML source
// @author Zoraida [2871443]
// @updateURL https://raw.githubusercontent.com/TornKit/drztrades/main/drzreceipts.user.js
// @downloadURL https://raw.githubusercontent.com/TornKit/drztrades/main/drzreceipts.user.js
// @match https://www.torn.com/trade.php*#step=logview*
// @icon https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant none 
// ==/UserScript==

// SET YOUR API KEY HERE //
const apiKey = `xxx`;

// My marketing variables
var myImage = `https://i.ibb.co/MBsRd9J/Screenshot-20240323-041550-Chrome.jpg`;

// Advertiser #1 variables
const adUrl = `https://i.ibb.co/8MDXrD7/Ad.gif`;
const adHref = `https://www.torn.com/forums.php#/p=threads&f=10&t=16389306&b=0&a=0`;

// Advertise #2 Variables
var ad2Url; //=`http://profileimages.torn.com/86756ceb-e2e1-4860-91e5-98801c93f553-2707253.gif`;
var ad2Href; //=`https://www.torn.com/forums.php#/p=threads&f=10&t=16384597&b=0&a=0`;

const suppMsg = `Support my partners and tell them Zoraida sent you!`;
const apiUrl = `https://api.torn.com/torn/?selections=items&key=${apiKey}`;
const itemValuePairs = [];

fetchData();

// Main execution starts after 7 seconds
setTimeout(() => {
  const parentNode = document.querySelector("#trade-container");
  const button = document.createElement('button');
  button.style.background = 'red';
  button.style.color = 'white';
  button.style.padding = '10px';
  button.style.fontSize = '14px';
  button.innerHTML = 'Receipt-o-matic';
  parentNode.appendChild(button);
  
  button.addEventListener('click', createTable);
}, 7000);

// Asynchronous function to fetch data from Torn API
async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items) {
      Object.entries(data.items).forEach(([itemId, itemData]) => {
        const itemName = itemData.name;
        const marketValue = itemData.market_value;
        itemValuePairs.push({ name: itemName, market_value: marketValue });
      });
    } else {
      console.error('Error: Unable to retrieve items data from the API response.');
    }
  } catch (error) {
    console.error('Error fetching data from the Torn API:', error);
  }
}

// Function to gather trade items
function getTradeItems() {
    return document.querySelectorAll("#trade-container > div.trade-cont.m-top10 > div.user.left > ul > li.color2.last > ul > li:nth-child(n) > div.name.left");
}

// Function to create the receipt table
function createTable() {
  let cellStyle;
  let cellStyleL;

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.borderSpacing = '0';

  const tableWrapper = document.createElement('div');
  tableWrapper.style.backgroundImage = "url('https://i.ibb.co/GtY1RdM/gradient-rainbow-glitter-background-23-2149683351.jpg')";
  tableWrapper.style.backgroundSize = 'cover';
  tableWrapper.style.textAlign = 'center';
  tableWrapper.style.padding = '20px';

  tableWrapper.appendChild(table);

  // Apply common styles for the table
  table.style.color = 'black';
  table.style.border = '2px solid #000000';
  table.style.borderRadius = '10px';
  table.style.boxShadow = '8px 8px 20px rgba(0, 0, 0, 0.6)';
  table.style.background = 'linear-gradient(to bottom, #ffccff, #99ff99)';

  const imageRow = table.insertRow();
  imageRow.insertCell(0).outerHTML = `<td style="text-align: center; font-size: 12px; border: 1px solid #000000; font-weight: bold; color: black;" colspan="4"><img width="250"  src="${myImage}" /></td>`;

  const headerRow = table.insertRow();
  const headerStyle = 'background-color: #ffffff; color: black;'; // Style for header cells

  headerRow.insertCell(0).outerHTML = `<th style="${headerStyle}">Item Name</th>`;
  headerRow.insertCell(1).outerHTML = `<th style="${headerStyle}">Quantity</th>`;
  headerRow.insertCell(2).outerHTML = `<th style="${headerStyle}">Item Price</th>`;
  headerRow.insertCell(3).outerHTML = `<th style="${headerStyle}">Total Value</th>`;

  const tradeItems = getTradeItems();
  let subtotal = 0;

  tradeItems.forEach(tradeItem => {
    const tradeHTML = tradeItem.innerHTML.trim();
    const splitValues = tradeHTML.split(" x");
    const itemName = splitValues[0].trim();
    const marketValue = itemValuePairs.find(item => item.name === itemName)?.market_value || 0;
    const totalMarketValue = splitValues[1] * marketValue;

    subtotal += totalMarketValue;

    const row = table.insertRow();
    row.insertCell(0).innerHTML = itemName;
    row.insertCell(1).innerHTML = splitValues[1] || '';
    row.insertCell(2).innerHTML = '$' + formatNumber(marketValue);
    row.insertCell(3).innerHTML = '$' + formatNumber(totalMarketValue);

    // Apply style to quantity, item price, and total value columns
    cellStyle = 'color: black; border: 1px solid #000000; text-align: right;'; // Assign value to cellStyle
    cellStyleL = 'color: black; text-align: left; border: 1px solid #000000;';
    row.cells[0].style = cellStyleL;
    row.cells[1].style = cellStyle; // Quantity column
    row.cells[2].style = cellStyle; // Item Price column
    row.cells[3].style = cellStyle; // Total Value column
  });

  const subtotalRow = table.insertRow();
  subtotalRow.insertCell(0).outerHTML = `<td style="${cellStyleL}" colspan="3">Subtotal</td>`;
  subtotalRow.insertCell(1).outerHTML = `<td style="${cellStyle}">$${formatNumber(subtotal)}</td>`;

  const drZRow = table.insertRow();
  drZRow.insertCell(0).outerHTML = `<td style="${cellStyleL}" colspan="3">Dr. Z Pays 98%</td>`;
  drZRow.insertCell(1).outerHTML = `<td style="${cellStyle}">$${formatNumber(Math.ceil(subtotal * 0.98))}</td>`;

  const adRow = table.insertRow();
  adRow.insertCell(0).outerHTML = `<td style="text-align: center; font-size: 12px; border: 1px solid #000000; font-weight: bold; color: black;" colspan="4"><a href="${adHref}"><img width="250"  src="${adUrl}" /></a></td>`;

  const suppRow = table.insertRow();
  suppRow.insertCell(0).outerHTML = `<td style="text-align: center; font-size: 10px; border: 1px solid #000000; font-weight: bold; color: black;" colspan="4" >${suppMsg}</td>`; 

  if (ad2Href && ad2Url) {
    const ad2Row = table.insertRow();
    ad2Row.insertCell(0).outerHTML = `<td style="text-align: center; font-size: 13px; border: 1px solid #000000; font-weight: bold; color: black;" colspan="4"><a href="${ad2Href}"><img width="250"  src="${ad2Url}" /></a></td>`;
  }

  const tableContainer = document.createElement('textarea');
  tableContainer.style.width = '100%';
  tableContainer.style.height = '300px';
  tableContainer.value = tableWrapper.outerHTML.replace(/&quot;/g, "'");
  // tableContainer.value = table.outerHTML; // Set the value to the HTML content of the table

  // Append textarea to the DOM
  const tradeContainer = document.querySelector('#trade-container');
  tradeContainer.appendChild(tableContainer);
}

// Function to get market value of an item
function getItemMarketValue(itemName) {
  const itemValuePair = itemValuePairs.find(pair => pair.name === itemName);
  return itemValuePair ? itemValuePair.market_value : 'N/A';
}

// Function to format numbers
function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number);
}
