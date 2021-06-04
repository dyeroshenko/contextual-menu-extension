/**
 * @fileoverview Builds contextual menu based on fetched content
 * from a config file
 */

/**
 * @function:
 * Takes base URL value, gets selected text on the page
 * Gets a user prompt for parameter(s) value
 * Redirects user to the source URL, based on menu choice
 * Stores generated URL in localStorage
 * @param {string} url
 * @param {string} parameters
 * @returns {none} creates submenu values
 **/
function handleUrl(url, parameters) {
  return function (value) {
    let valueString = value.selectionText;
    let finalUrl = url + valueString;

    if (parameters) {
      let parametersArray = [];

      for (let key in parameters) {
        let userPrompt = prompt(`Add a value for parameter: ${parameters[key]}`);
        let fullParam = `${parameters[key]}=${userPrompt}`;
        parametersArray.push(fullParam);
      }
      fullParameters = '&' + parametersArray.join('&');
      finalUrl = url + valueString + fullParameters;
    }

    chrome.tabs.create({
      url: finalUrl
    });
    addRecentUrlToStorage(finalUrl);
  };
}

/**
 * @function:
 * Gets the remote configuration file with data
 * @return {promise}
 */
async function getData() {
  let url = window.localStorage.getItem('urlPath');
  try {
    let res = await fetch(url, {
      mode: 'cors'
    });
    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

/**
 * @function:
 * Iterates through a dict of base urls and init context menu
 * While clicked initiates lookupValue() func
 * Gets parameters if set from config
 */
async function initMenu() {

  let data = await getData();

  for (let key in data.urls) {
    let baseUrl = data.urls[key]['base'];
    let parameters = data.urls[key]['parameters'];

    chrome.contextMenus.create({
      title: key,
      contexts: ["selection"],
      onclick: handleUrl(baseUrl, parameters)
    });
  }
}

/**
 * @function:
 * Takes a recent URL and adds it to <array> in Local Storage
 * @param {string} newUrl
 * @returns {none} adds value to localStorage
 */
function addRecentUrlToStorage(newUrl) {
  let visitedUrls = JSON.parse(localStorage.getItem("visitedUrls"));

  if (visitedUrls == null) {
    visitedUrls = [];
  }
  visitedUrls.push(newUrl);
  localStorage.setItem("visitedUrls", JSON.stringify(visitedUrls));
}


//init menu in Chrome while extension is running
initMenu();
