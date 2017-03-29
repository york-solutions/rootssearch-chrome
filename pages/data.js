// Get tab id from url
var tabId = getParameterByName('id');

// Get data
var background = chrome.extension.getBackgroundPage(),
    data = background.getData(tabId),
    gedcomx = new GedcomX(data.data);

// Don't have much data here to report. Perhaps in the
// future we could query the tab URL.
// TODO: Show error message if there is no data.
if(!data) {
  ga('send', 'event', 'error', 'noData');
}

// Calculate person's display summary
var principalPerson = gedcomx.getPrincipalPerson();
document.querySelector('.person-info .person-name').textContent = principalPerson.getDisplayName();
document.querySelector('.person-info .person-lifespan').textContent = principalPerson.getLifespan();

// Setup button listeners
document.getElementById('search-btn').addEventListener('click', function(){
  rsPost(data);
});
document.getElementById('save-btn').addEventListener('click', function(){
  document.getElementById('view1').classList.add('slide-out');
  document.getElementById('view2').classList.add('slide-in');
});
document.getElementById('save-fs-btn').addEventListener('click', function(){
  fsPost(data);
});

/**
 * Send to rootssearch.io search form
 */
function rsPost(data){
  postData(background.getRSDomain() + '/search', {
    gedcomx: data.data,
    url: data.url
  });
}

/**
 * Send to rootssearch.io FS save page
 */
function fsPost(data){
  postData(background.getRSDomain() + '/save/fs', {
    gedcomx: data.data
  });
}

/**
 * POST data to any URL by dynamically generating and submitting a form.
 * 
 * http://stackoverflow.com/a/17793207
 * 
 * @param {String} url URL to POST to
 * @param {Object} data map of data to POST. keys turn into input names.
 */
function postData(url, data) {
  var form = document.createElement('form');
  form.action = url;
  form.method = 'POST';
  if (data) {
    for (var key in data) {
      var input = document.createElement('input');
      input.name = key;
      input.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
      form.appendChild(input);
    }
  }
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
}

// http://stackoverflow.com/a/5158301/879121
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
