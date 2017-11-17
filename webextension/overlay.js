function setup (myURL)
{
	//logg ("updated url: " + myURL);
	
	// is this url ok?
	if (!myURL || !validURL (myURL))
	{
		if (myURL)
			updateLong (myURL);
		else
			updateLong ("no url");
		updateShort ("won't shorten this url.");
		return;
	}
	
	// setup urls in form
	updateLong (myURL);
	updateShort ("loading...");
	
	// addSelection as default keyword if keyword-textfield
	var text = document.getElementById("___yourls_key"); 
	if (text && !document.getElementById("___yourls_body"))
			text.value = window.getSelection ().toString ();
	
	// add listener to keyword-button if it exists
	var keyBtn = document.getElementById("___yourls_shortenbtn");
	if (keyBtn)
	{
		updateShort ("waiting for keyword...");
		keyBtn.addEventListener("click", function ()
		{
			updateShort ("loading...");
			shorten (myURL);
		});
	}
	else
	{
		// if we're not waiting for a keyword let's shorten immediately
		shorten (myURL);
	}
}

function validURL (url)
{
	// just shorten urls that have a protocol and a domain
	return url.match (/^\S+\:\/\/[^\/]+\.\S+$/);
}

function shortLong (url)
{
	// long url? -> shorten it for display
	if (url.length > 45)
	{
		// remove http:// etc
		url = url.replace (/^\S+\:\/\//, "");
		// remove #anchor and ?key=value
		url = url.replace (/[#\?].+$/, "..")
		// remove everything between domain name and file name
		url = url.replace (/^([^\/]+)\/.*\/((?!\.\.)[^\/]+)(\/..)?$/,"$1/../$2$3");
		//url = splitURL (url);
	}
	// still too long?
	if (url.length > 45)
	{
		// replace some.sub.domain.tld with domain.tld
		url = url.replace (/^\S+\.([^.]+\.[^.]+)\//, "$1/");
		// replace verylongwords with very..words
		url = url.replace (/([^\/.]{5})[^\/.]{10,}([^\/.]{5})/g, "$1..$2");
		//url = reSplitURL (url);
	}
	return url;
}

function updateLong (str)
{
	var elem = document.getElementById ("___yourls_todo");
	if (!elem)
		return;
	elem.innerHTML=shortLong(str);
	elem.title=str;
}
function updateShort (str)
{
	var elem = document.getElementById ("___yourls_done");
	if (!elem)
		return;
	elem.value=str;
	elem.title=str;
}


function shorten (url)
{
	updateShort ("shortening...");
	
	var keyword;
	var keywordTF = document.getElementById("___yourls_key");
	if (keywordTF)
		keyword = keywordTF.value;
	
	browser.runtime.sendMessage({method: "shortenLink", url: url, keyword: keyword}, function (response)
	{
		console.error ("popup reveives message: shortenLink");
		console.error (response);
		updateShort (response.url);
		// select the short url -> ^c
		var range = document.createRange();
		range.selectNode(document.getElementById ("___yourls_done"));
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}, function (error) {console.error (error)});
}
function injectPage (url)
{
	var parent = document.getElementById ("___yourls_div");
	if (parent)
	{
		browser.runtime.sendMessage({method: "getHTML"}, function (response)
		{
			parent.innerHTML = response.data;
			
			// get url if we're in popup
			if (!url)
			{
				browser.runtime.sendMessage ({method: "getSiteURL"}, function (response)
				{
					url = response.url;
					setup (url)
				});
			}
			else
				setup (url);
		});
	} else {
		console.error ("couldn't find ___yourls_div");
	}
	
}

function createOverlay (url)
{
	if (document.getElementById ("___yourls_overlay") || document.getElementById("___yourls_body"))
		return;
	
	var overlay = document.createElement ("div");
	overlay.id = "___yourls_overlay";
	var h3 = document.createElement ("h3");
	h3.appendChild(document.createTextNode("Shorten URL with YOURLS"));
	overlay.appendChild (h3);
	var div = document.createElement ("div");
	div.id = "___yourls_div";
	overlay.appendChild (div);
	var input = document.createElement ("input");
	input.type = 'button';
	input.value = 'close';
	input.addEventListener('click', function (e)
	{
		overlay.parentNode.removeChild(overlay);
	}); 
	overlay.appendChild (input);
	document.body.appendChild (overlay);
	injectPage (url);
}



function UrlListener (request, sender, sendResponse) {
  console.log (request.url);
  
  createOverlay (request.url);
  
}
browser.runtime.onMessage.addListener(UrlListener);