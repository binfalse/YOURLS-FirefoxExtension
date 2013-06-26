var YOURLSshortener = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService (Components.interfaces.nsIPrefBranch);
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	return {
		gohome : function () {
				var api = prefManager.getCharPref ("extensions.yourls-shortener.api");
				if (api.substr (-1) != '/')
					api += '/';
				openUILinkIn(api + "admin/", "tab");
				return;
		},
		test : function () {
			var api = document.getElementById("api");
			var signature = document.getElementById("signature");
			var maxwait = document.getElementById("maxwait");
			var askforkey = document.getElementById("askforkey");
			var fail = "";
			
			if (!api || !signature || !maxwait || !askforkey)
			{
				prompts.alert(null, "YOURLS shortener: test failed", "A bug occured!\nSry, please contact the developer at http://binfalse.de");
				return;
			}
			
			if (!api.value)
				fail += "Please specify an API-URL!\n";
			else if (!api.value.match (/^http\S+$/))
				fail += "API-URL has to start with http, white-spaces are not allowed!\n";
			
			if (fail)
			{
				prompts.alert(null, "YOURLS shortener: test failed", "Test failed:\n" + fail);
				return;
			}
			
			//alert (askforkey.value);
			//alert (maxwait.value);
			var checked = askforkey.checked;
			prefManager.setCharPref ("extensions.yourls-shortener.api", api.value);
			prefManager.setCharPref ("extensions.yourls-shortener.signature", signature.value);
			prefManager.setBoolPref ("extensions.yourls-shortener.askforkey", false);
			prefManager.setIntPref ("extensions.yourls-shortener.maxwait", maxwait.value);
			
			this.run ("http://binfalse.de/");
			prefManager.setBoolPref ("extensions.yourls-shortener.askforkey", checked);
			return;
		},
		linkDest : function () {
			try {
				return gContextMenu.linkURL // new FF, other?
			}
			catch(e) {
				try {
					return gContextMenu.linkURL() // old FF, SM, other?
				}
				catch(e) {
					return String(gContextMenu.link) // either FF, other?
				}
			}
		},
		changeButtons : function (icon) {
			var btn = document.getElementById("yourls-shortener-toolbar-button");
			if (btn)
				btn.style.listStyleImage = 'url("chrome://yourls-shortener/skin/' + icon + '")';
			var btn = document.getElementById("yourls-shortener-status-bar-icon");
			if (btn)
				btn.src = 'chrome://yourls-shortener/skin/' + icon;
		},
		failed: function () {
			if (!prefManager.getBoolPref ("extensions.yourls-shortener.changeicons"))
				return;
			this.changeButtons ("favicon-failed.gif");
			var obj = this;
			setTimeout (function () {
				obj.changeButtons ("favicon.gif")
			},3000);
		},
		success : function () {
			if (!prefManager.getBoolPref ("extensions.yourls-shortener.changeicons"))
				return;
			this.changeButtons ("favicon-success.gif");
			var obj = this;
			setTimeout (function () {
				obj.changeButtons ("favicon.gif")
			},3000);
		},
		run : function (long) {
			
			if (typeof gContextMenu != 'undefined' && gContextMenu.onLink)
				long = this.linkDest ();
			
			if (!long)
			{
				prompts.alert(null, "YOURLS shortener: failed", "no URL specified!?");
				return;
			}
			
			if (long != "http://binfalse.de/")
				if (!(Services.io.getProtocolFlags(makeURI(long).scheme) & Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE))
				{
					prompts.alert(null, "URL invalid", "This URL is not valid");
					return;
				}
			
			var api = prefManager.getCharPref ("extensions.yourls-shortener.api");
			if (api.substr (-1) != '/')
				api += '/';
			api += "yourls-api.php";
			
			var me = this;
			if (api && api != "http://yoursite/")
			{
				try
				{
					var params = "action=shorturl&format=simple&url=" + encodeURIComponent (long) + "&signature=" + encodeURIComponent (prefManager.getCharPref ("extensions.yourls-shortener.signature"));
					
					if (prefManager.getBoolPref ("extensions.yourls-shortener.askforkey"))
					{
						var sel = "";
						try
						{
							sel = content.getSelection () + "";
						}
						catch (e) {}
						
						var key = {value: sel};
						if (prompts.prompt (null, "YOURLS shortener: Keyword", "Type your keyword here (leave empty to generate)", key, null, {value: false}))
						{
							if (key.value)
								params += "&keyword=" + encodeURIComponent (key.value);
						}
						else
							return;
					}
					
					var maxwait = 1000 * prefManager.getIntPref ("extensions.yourls-shortener.maxwait");
					if (!maxwait || maxwait < 2000)
						maxwait = 2000;
					
					var request = new XMLHttpRequest ();
					request.open ("POST", api, true);
					request.setRequestHeader ("Content-type", "application/x-www-form-urlencoded");
					request.setRequestHeader ("Content-length", params.length);
					request.setRequestHeader ("Connection", "close");
					
					var requestTimer = setTimeout (function () {
						request.abort ();
						prompts.alert(null, "YOURLS shortener: failed", "Did not get an answer from server!\nTry again later or increase maximum waiting time.");
						me.failed ();
						return;
					}, maxwait);
					request.onreadystatechange = function () {
						if (request.readyState != 4)
							return;
						clearTimeout (requestTimer);
						if ((request.status == 200 || request.status == 201) && request.responseText.match(/^\s*\S+\s*$/))
						{
							if (prefManager.getBoolPref ("extensions.yourls-shortener.showprompt"))
								prompts.alert (null, "YOURLS shortener: short URL", long + "\n\nis shortened by:\n\n" + request.responseText);
							
							if (prefManager.getBoolPref ("extensions.yourls-shortener.copyclipboard"))
								clipboard.copyString (request.responseText);
							
							me.success ();
							return;
						}
						else if ((request.status == 200 || request.status == 201) && request.responseText.match(/^\s*$/))
						{
							prompts.alert(null, "YOURLS shortener: failed", "Shortening failed.. Maybe chosen key already in use!?\nTry again!");
							me.failed ();
							return;
						}
						else
						{
							prompts.alert(null, "YOURLS shortener: failed", "Do not understand the response from API!\nPlease check your signature and the API-URL.");
							me.failed ();
							return;
						}
					}
					
					request.send (params);
				}
				catch (e) 
				{
					prompts.alert(null, "YOURLS shortener: failed", "Failed to start XMLHttpRequest:\n" + e.message);
					me.failed ();
				}
				
			}
			else 
			{
				prompts.alert(null, "YOURLS shortener: failed", "No API-URL specified... Check your settings!");
				me.failed ();
			}
		}
	};
} ();