// Set the debug flag if the extension isn't installed via the webstore
var debug = chrome.app.getDetails().update_url ? false : true;

var rsDomain = debug ? 'https://rootssearch-www-justincy.c9.io' : 'https://rootssearch.io';

// Store for person data we extract from the pages.
// Data is stored by tabId. Data is overwritten when
// the user navigates. Data is cleared (memory freed)
// when a tab is closed.
var personDataObjects = {};

chrome.browserAction.setBadgeBackgroundColor({
  color: '#49AFCD'
});

ga('send', 'event', 'start', 'version', chrome.app.getDetails().version);

// Listen for clicks on the browser action icon
chrome.browserAction.onClicked.addListener(function(tab){
  var data = getData(tab.id);

  // If there's person data on the tab then
  // open post helper that will forward to rs.io
  // since we can't POST directly to a tab from here.
  // Send the post helper the tabId in the URL so
  // that it can request the person data for posting.
  if(data){
    chrome.tabs.create({
      url: chrome.extension.getURL('/redirect/redirect.html?id=' + tab.id)
    });
    ga('send', 'event', 'click', 'data');
  }

  // If there's no data on the tab then
  // send user to rs.io with empty form
  else {
    chrome.tabs.create({
      url: rsDomain + '/search'
    });
    ga('send', 'event', 'click', 'noData');
  }
});

// Listen for events from content scripts
chrome.extension.onRequest.addListener(function(request, sender) {

  ga('send', 'pageview', sender.tab.url);

  // A scraper found person data and the content
  // script sent it to us
  if(request.type === 'data') {

    // Verify format of dates; they cause errors if they're not valid
    if(typeof request.data.birthDate !== 'undefined' && !isValidDate(request.data.birthDate)) {
      if( debug ) {
        console.error('Bad birth date: ' + request.data.birthDate);
      }
      delete request.data.birthDate;
    }
    if(typeof request.data.deathDate !== 'undefined' && !isValidDate(request.data.deathDate)) {
      if( debug ) {
        console.error('Bad death date: ' + request.data.deathDate);
      }
      delete request.data.deathDate;
    }

    // Show the RootsSearch icon
    // TODO: update when url changes (I believe this happens automatically)
    chrome.browserAction.setBadgeText({
      text: '1',
      tabId: sender.tab.id
    });

    // Store the data
    personDataObjects[sender.tab.id] = {
      'data': request.data,
      'url': sender.tab.url
    };

    ga('send', 'event', 'pageLoad', 'data');
  }

  else if(request.type === 'noData') {
    ga('send', 'event', 'pageLoad', 'noData');
    chrome.browserAction.setBadgeText({
      text: '',
      tabId: sender.tab.id
    });
    delete personDataObjects[sender.tab.id];
  }

  else if(request.type === 'js_error'){
    ga('send', 'event', 'error', 'jsError', sender.tab.url);
    delete personDataObjects[sender.tab.id];
  }

});

// Cleanup personData when a tab closes
chrome.tabs.onRemoved.addListener(function(tabId){
  delete personDataObjects[tabId];
});

/**
 * Get the person data object for a specific tab.
 */
function getData(tabId){
  return personDataObjects[tabId];
}

function getRSDomain(){
  return rsDomain;
}

/**
 * Returns true if the given date string
 * will convert into a valid date.
 */
function isValidDate(d) {
  d = new Date(d);
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}
