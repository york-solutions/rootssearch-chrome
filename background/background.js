// Set the debug flag if the extension isn't installed via the webstore
var debug = chrome.app.getDetails().update_url ? false : true;

var rsDomain = debug ? 'https://rootssearch-www-justincy.c9.io' : 'http://rootssearch.io/search';

// Store for person data we extract from the pages
// TODO: empty; currently a memory leak
var personDataObjects = {};

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
  }
  
  // If there's no data on the tab then
  // send user to rs.io with empty form
  else {
    chrome.tabs.create({
      url: rsDomain + '/search'
    });
  }
});

// Listen for events from content scripts
chrome.extension.onRequest.addListener(function(request, sender) {

  // A scraper found person data and the content
  // script sent it to us
  if( request.type == "person_info" ) {
    
    // Verify format of dates; they cause errors if they're not valid
    if( typeof request.data.birthDate !== 'undefined' && !isValidDate(request.data.birthDate) ) {
      if( debug ) {
        console.error('Bad birth date: ' + request.data.birthDate);
      }
      delete request.data.birthDate;
    }
    if( typeof request.data.deathDate !== 'undefined' && !isValidDate(request.data.deathDate) ) {
      if( debug ) {
        console.error('Bad death date: ' + request.data.deathDate);
      }
      delete request.data.deathDate;
    }
    
    // Show the RootsSearch icon
    // TODO: update when url changes
    chrome.browserAction.setBadgeText({
      text: '1',
      tabId: sender.tab.id
    });
    
    // Store the data
    personDataObjects[sender.tab.id] = {
      'data': request.data,
      'url': sender.tab.url
    };
  }
  
});

chrome.browserAction.setBadgeBackgroundColor({
  color: '#49AFCD'
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
};