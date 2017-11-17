
browser.contextMenus.create({
  id: "yourls",
  title: "Shorten URL",
  contexts: ["all"]
});




function shortenClick(info, tab)
{
	
	let executing = browser.tabs.executeScript({file: "overlay.js"});
	executing.then (function (result) {
	
	browser.tabs.query({
        active: true,
        currentWindow: true
    }).then(function (tabs) {
		browser.tabs.sendMessage(tabs[0].id, {
			url: info.linkUrl ? info.linkUrl : info.pageUrl
		});
	})});
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "yourls") {
		shortenClick (info, tab)
    }
});

browser.runtime.onMessage.addListener (function(request, sender, sendResponse)
{
	if (request.method == "getHTML")
	{
		var keyword = false;
		browser.storage.local.get('keyword').then (
			function (val) {
				sendResponse ({data: "<div class='___yourls_todo'>Source URL: <strong id='___yourls_todo'></strong></div>"
				+ (val ? 
				"<div id='___yourls_keyword'>Keyword: <input type='text' id='___yourls_key' /> <input type='submit' id='___yourls_shortenbtn' value='shorten' /></div>" : "")
				+ "<div class='___yourls_done'>Short URL : <input type='text' id='___yourls_done'/></div>"});
			}, function (err) {
				sendResponse ({data: "<div class='___yourls_todo'>Source URL: <strong id='___yourls_todo'></strong></div>"
				+ "<div class='___yourls_done'>Short URL : <input type='text' id='___yourls_done'/></div>"});
			}
		);
		return true;
	}
	else if (request.method == "shortenLink")
	{
		browser.storage.local.get().then(  function(settings) {
			
		var options = {
			action: 'shorturl',
			format: 'simple',
			url: request.url,
			signature: settings.signature,
			keyword: request.keyword
		};
			
		YOURLS (settings, options).then(function(result) {
			sendResponse ({url: result});
		}, function(error) {
			sendResponse ({url: error ? error.message : 'Unknown error'});
		});
		}, function (error) {
			sendResponse ({url: "did not find settings"});
		});
		
		return true;
	}
	else if (request.method == "getSiteURL")
	{
		browser.tabs.getSelected(null, function(tab)
		{
			sendResponse ({url : tab.url});
		});
		return true;
	}
	else if (request.method == "getSelectionInTab" || request.method == "getSelection")
	{
		var sel = window.getSelection ().toString ();
		sendResponse ({data: window.getSelection ().toString ()});
		return true;
	}
	return false;
});


function YOURLS(settings, options, expected) {
    var expMatchString = expected || '^\\s*(\\S+)\\s*$';
    var apiURL = settings.api;
    if (apiURL.substr(-1) != '/')
		apiURL += '/';
    apiURL += 'yourls-api.php';
    var qParams = '';
    for (var k in options) {
		if (options.hasOwnProperty(k)) {
			if (qParams.length) qParams += '&';
			qParams += k + '=' + encodeURIComponent(options[k]);
		}
    }
    return new Promise((resolve, reject) => {
	var xhr = new XMLHttpRequest();
	var rqTimer = setTimeout(
	    function() {
		xhr.abort();
		reject(new Error('Timed out'));
	    }, (parseInt(settings.maxwait) || 5) * 1000
	);
	
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4) {
			clearTimeout(rqTimer);
			if ((xhr.status == 200) || (xhr.status == 201)) {
				var uMatch = xhr.responseText.match (new RegExp(expMatchString));
				if (uMatch) {
					resolve (uMatch[1]);
				} else {
					reject (new Error ('Invalid: ' + xhr.responseText));
				}
			} else {
				reject (new Error ('Error: Server returned status ' + xhr.status + " (" + xhr.statusText + ")"));
			}
	    }
	};
	
	xhr.open('POST', apiURL, true);
	xhr.setRequestHeader('Content-type',
			     'application/x-www-form-urlencoded');
	xhr.send(qParams);
    });
}




