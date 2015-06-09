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
  $.each(data.data, function(name, value){
    $form.append(createHiddenInput('data[' + name + ']', value));
  });
  
  $form.append(createHiddenInput('url', data.url));
  
  $form.submit();
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