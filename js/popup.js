/**
 * @fileoverview This file renders content in popup.html
 * validates and handles input taken from a user
 */

 const input = document.getElementById('path');
 const button = document.getElementById('confirm_button');
 const team_status = document.getElementById('team_status');
 const config_status = document.getElementById('config_status');
 const recentUrls = document.getElementById('recentUrls');
 const clearButton = document.getElementById('clear');

 /**
  * @function: Takes a string <url> as a parameter and saves it to local storage
  * @param {string} url
  */
 function saveConfigPathtoLocalStorage(url) {
   window.localStorage.setItem('urlPath', url);
 }

 /**
  * @function: Gets stored value from localStorage
  * @returns {string}'urlPath' from local storage
  */
 function getConfigPathFromStorage() {
   value = window.localStorage.getItem('urlPath');
   return value;
 }

 /**
  * @function: Takes value key in local storage and removes it
  * @param {string} value
  */
 function removeConfigPathFromLocalStorage(value) {
   localStorage.removeItem(value);
 }

 /**
  * @function: Takes a string and validates if this is a URL pattern
  * @param {string} url
  * @returns {bool}
  */
 function isValidUrl(url) {
   let regex = new RegExp('https?://(www.)?S*', 'g');
   return regex.test(url);
 }

 /**
  * @function: Gets the remote configuration file with data
  * Validates if url / file is correct
  * Returns promise or cleares the Local Storage
  * @returns {promise}
  */
 async function getData() {
   let url = window.localStorage.getItem('urlPath');

   if (url && isValidUrl(url) == true) {
     try {
       let res = await fetch(url, {
         mode: 'cors'
       });
       return await res.json();
     } catch (error) {
       console.log(error);
     }
   } else {
     alert('[Error]: Unable to process a link. Please check if the url / file is correct');
     removeConfigPathFromLocalStorage('urlPath');
   }
 }

 /**
  * @function
  * Renders active sync status, team and 5 recently visited urls
  */
 async function renderUI() {
   let data = await getData();
   let value = data.team;

   if (value) {
     team_status.textContent = value;
     config_status.textContent = 'Success';
   }

   showRecentlyVisited();
 }

 /**
  * @function
  * Loads recently visited urls from local storage and renders it in UI
  * Renders <clear> button if there are urls
  */
 function showRecentlyVisited() {
   let urls = JSON.parse(localStorage.getItem("visitedUrls"));
   let table = document.getElementById('table');

   for (i = 0; i <= 5; i++) {

     let value = urls[i];

     if (value) {
       let tr = document.createElement('tr');
       let td = document.createElement('td');

       let a = document.createElement('a');
       a.setAttribute('href', value);
       a.setAttribute('target', '_blank');
       a.textContent = value;

       td.appendChild(a);
       tr.appendChild(td);
       table.appendChild(tr);

       clearButton.classList.add('active');
     }
   }
 }

 /**
  * @function
  * Removes recently visited urls list from UI and reloads extension
  */
 function removeRecentlyVisited(){
   localStorage.removeItem('visitedUrls');
   chrome.runtime.reload();
 }

 /**
  * @function:
  * Gets the config file from input and interacts with user
  * Validates if value from input is non-empty and in correct format
  */
 function handleInputLink() {
   let value = input.value;

   if (value && isValidUrl(value) == true) {
     saveConfigPathtoLocalStorage(value);
     alert('Added!');
     chrome.runtime.reload();
   } else {
     alert('[Error]: Empty or non-url value. Please try again!');
   }
 }


 window.addEventListener('DOMContentLoaded', renderUI);
 button.addEventListener('click', handleInputLink);
 clearButton.addEventListener('click', removeRecentlyVisited);
