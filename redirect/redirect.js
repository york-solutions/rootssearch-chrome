// Get tab id from url
var tabId = getParameterByName('id');

// Get data
var background = chrome.extension.getBackgroundPage(),
    data = background.getData(tabId);

// Post
if(data){
  rsPost(data);
}

// Show error message if there is no data
// TODO: automatically record/report error
else {

}

/**
 * Send user to rs.io by filling a form and POSTing
 */
function rsPost(data){
  var $form = $('#form');

  // Add proper domain to form action
  $form.attr('action', background.getRSDomain() + $form.attr('action'));

  // Add person data
  $form.append(createHiddenInput('gedcomx', JSON.stringify(data.data)));

  // Add the url
  $form.append(createHiddenInput('url', data.url));

  // Check to see if we should send old site settings.
  // We send them the first time the new extension POSTs
  // to the new search page.
  chrome.storage.local.get({'_site-settings-posted':false}, function(items){
    if(!items['_site-settings-posted']){

      // Get a list of all stored values. Extract enabled sites.
      chrome.storage.local.get(null, function(items){
        var sites = [];
        for(var key in items){
          if(key.indexOf('site-') === 0 && items[key].enabled){
            sites.push(key.split('-')[1]);
          }
        }

        // Save setting so that we know we've POSTed the sites
        // and therefore don't need to do it again
        if(sites.length){
          $form.append(createHiddenInput('_sites', sites.join(',')));
          ga('send', 'event', 'settings', 'saved');
          $form.submit();
        }

        // No site settings so just POST
        else {
          ga('send', 'event', 'settings', 'none');
          $form.submit();
        }

        chrome.storage.local.set({'_site-settings-posted': true});
      });
    }

    else {
      ga('send', 'event', 'settings', 'alreadySaved');
      $form.submit();
    }
  });
}

/**
 * Create a hidden form element
 */
function createHiddenInput(name, value){
  return $('<input>')
    .attr('type', 'hidden')
    .attr('name', name)
    .val(value);
}

// http://stackoverflow.com/a/5158301/879121
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function resetSettings(cb){
  clearSetting(function(){
    debugSettings(cb);
  });
}

function debugSettings(cb){
  chrome.storage.local.set({"site-americanancestors":{"enabled":true},"site-ancestry":{"enabled":true},"site-archives":{"enabled":true},"site-billiongraves":{"enabled":false},"site-chroniclingamerica":{"enabled":false},"site-familysearch":{"enabled":true},"site-findagrave":{"enabled":true},"site-findmypast":{"enabled":true},"site-findmypast.co.uk":{"enabled":true},"site-findmypast.com":{"enabled":false},"site-fold3":{"enabled":false},"site-genealogieonline":{"enabled":false},"site-genealogybank":{"enabled":false},"site-geneanet.en":{"enabled":false},"site-gengophers":{"enabled":false},"site-geni":{"enabled":false},"site-google":{"enabled":true},"site-mocavo":{"enabled":false},"site-myheritage":{"enabled":false},"site-newspapers":{"enabled":false},"site-nlatrove":{"enabled":false},"site-openarchives":{"enabled":false},"site-usgenweb":{"enabled":false},"site-werelate":{"enabled":false},"site-wikitree":{"enabled":false},"site-worldvitalrecords":{"enabled":false}}, cb);
}

function clearSettings(cb){
  chrome.storage.local.clear(cb);
}
