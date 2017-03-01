genscrape()
  .on('data', function(data){
    chrome.extension.sendRequest({
      type: 'data',
      data: data
    });
  })
  .on('noData', function(){
    chrome.extension.sendRequest({
      type: 'noData'
    });
  })
  .on('error', function(exception){
    chrome.extension.sendRequest({
      type: 'js_error',
      data: {
        title: exception.name,
        message: exception.message + "\n\n" + exception.stack,
        url: document.location.href
      }
    });
  });
