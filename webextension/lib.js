// create a proper DOM link
function createLink (url, text) {
	if (!text)
		text = url;
	
	var a = document.createElement ('a');
	a.appendChild (document.createTextNode (text));
	a.title = text;
	a.href = url;
	return a;
}

// inject supplemental information into a DOM element
// this will create proper links for recognised and allowed link contents
function injectSupplemental (node, supp) {
	while (node.firstChild)
		node.removeChild(node.firstChild);
	
	if (!supp.text)
		return;
	
	if (supp.links && supp.links.length > 0) {
		var text = [supp.text];
		for (var i = 0; i < supp.links.length; i++) {
			for (var j = 0; j < text.length; j++) {
				var idx = text[j].indexOf (supp.links[i]);
				if (idx >= 0) {
					text.splice (j, 1, text[j].substring (0, idx), text[j].substring (idx, idx + supp.links[i].length), text[j].substring (idx + supp.links[i].length));
					j = j + 1;
				}
			}
		}
		
		var found = false;
		for (var j = 0; j < text.length; j++) {
			found = false;
			for (var i = 0; i < supp.links.length; i++) {
				if (text[j].indexOf (supp.links[i]) === 0 && text[j].length == supp.links[i].length){
					if (text[j].indexOf ("extension's settings") === 0) {
						var settingslink = createLink ("", text[j]);
						settingslink.addEventListener(
							'click',
							function(se) {
								browser.runtime.openOptionsPage();
							}
						);
						node.appendChild (settingslink);
					} else {
						node.appendChild (createLink (text[j]));
					}
					found = true;
				}
			}
			if (!found)
				node.appendChild (document.createTextNode (text[j]));
		}
		
	} else {
		node.appendChild (document.createTextNode (supp.text));
	}
	
}


var communicationErrorMsg = {
	text: "This seems like a serious bug!? Could you please file a bug report at https://github.com/binfalse/YOURLS-FirefoxExtension/issues/new and explain what you did? This would help improving the add-on.",
	links: ["https://github.com/binfalse/YOURLS-FirefoxExtension/issues/new"]
};
