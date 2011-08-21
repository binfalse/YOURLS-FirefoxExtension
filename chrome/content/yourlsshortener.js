var YOURLSshortener = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService (Components.interfaces.nsIPrefBranch);
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
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
			
			alert (askforkey.value);
			alert (maxwait.value);
			prefManager.setCharPref ("extensions.yourls-shortener.api", api.value);
			prefManager.setCharPref ("extensions.yourls-shortener.signature", signature.value);
			prefManager.setBoolPref ("extensions.yourls-shortener.askforkey", askforkey.checked);
			prefManager.setIntPref ("extensions.yourls-shortener.maxwait", maxwait.value);
			
			this.run ("http://binfalse.de/");
			return;
		},
		run : function (long) {
			if (!long)
			{
				prompts.alert(null, "YOURLS shortener: failed", "no URL specified!?");
				return;
			}
			
			var api = prefManager.getCharPref ("extensions.yourls-shortener.api");
			if (api.substr (-1) != '/')
				api += '/';
			api += "yourls-api.php";
			
			if (api && api != "http://yoursite/")
			{
				try
				{
					var params = "action=shorturl&format=simple&url=" + long + "&signature=" + prefManager.getCharPref ("extensions.yourls-shortener.signature");
					
					if (prefManager.getBoolPref ("extensions.yourls-shortener.askforkey"))
					{
						var sel = "";
						try
						{
							sel = content.getSelection () + "";
						}
						catch (e) {}
						
						var key = prompt ("Type your keyword here (leave empty to generate)", sel.toLowerCase ());
						if (key)
							params += "&keyword=" + key;
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
						return;
					}, maxwait);
					request.onreadystatechange = function () {
						if (request.readyState != 4)
							return;
						clearTimeout (requestTimer);
						if ((request.status == 200 || request.status == 201) && request.responseText.match(/^\s*\S+\s*$/))
						{
							if (request.responseText)
							{
								prompts.alert(null, "YOURLS shortener: short URL", long + "\n\nis shortened by:\n\n" + request.responseText);
								return;
							}
							else
							{
								prompts.alert(null, "YOURLS shortener: failed", "Shortening failed.. Maybe invalid key!?");
								return;
							}
						}
						else
						{
							prompts.alert(null, "YOURLS shortener: failed", "API returned crap! Please check your signature and the API-URL.");
							return;
						}
					}
					
					request.send (params);
				}
				catch (e) 
				{
					prompts.alert(null, "YOURLS shortener: failed", "Failed to start XMLHttpRequest:\n" + e.message);
				}
				
			}
			else 
				prompts.alert(null, "YOURLS shortener: failed", "No API-URL specified... Check your settings!");
		}
	};
} ();