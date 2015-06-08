// Set the debug flag if the extension isn't installed via the webstore
var debug = chrome.app.getDetails().update_url ? false : true;

var personDataObjects = {};

// List for events from content scripts
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

function isValidDate(d) {
  d = new Date(d);
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
};