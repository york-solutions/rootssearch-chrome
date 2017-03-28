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
  var $form = document.getElementById('form');
  $form.action = background.getRSDomain() + '/search';
  $form.gedcomx.value = JSON.stringify(data.data);
  $form.url.value = data.url;
  $form.submit();
}

// http://stackoverflow.com/a/5158301/879121
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
