var YOURLSshortener = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService (Components.interfaces.nsIPrefBranch);
	return {
		gohome : function () {
				var api = prefManager.getCharPref ("extensions.yourls-shortener.api");
				if (api.substr (-1) != '/')
					api += '/';
				openUILinkIn(api + "admin/", 'tab');
				return;
		},
		run : function (long) {
			if (!long)
			{
				alert ("lost my URL!?");
				return;
			}
			
			var api = prefManager.getCharPref ("extensions.yourls-shortener.api");
			if (api.substr (-1) != '/')
				api += '/';
			api += "yourls-api.php";
			
			if (api && api != 'http://yoursite/')
			{
				try
				{
					var params = 'action=shorturl&format=simple&url=' + long + '&signature=' + prefManager.getCharPref ("extensions.yourls-shortener.signature");
					
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
							params += '&keyword=' + key;
					}
					
					var maxwait = 1000 * prefManager.getIntPref ("extensions.yourls-shortener.maxwait");
					if (!maxwait || maxwait < 2000)
						maxwait = 2000;
					
					var request = new XMLHttpRequest ();
					request.open ("POST", api, false);
					request.setRequestHeader ("Content-type", "application/x-www-form-urlencoded");
					request.setRequestHeader ("Content-length", params.length);
					request.setRequestHeader ("Connection", "close");
					
					var requestTimer = setTimeout (function () {
						request.abort ();
						alert ("Did not get an answer from server!\nTry again later or increase maximum waiting time.");
						return;
					}, maxwait);
					request.onreadystatechange = function () {
						if (request.readyState != 4)
							return;
						clearTimeout (requestTimer);
						if (request.status == 200 || request.status == 201)
						{
							if (request.responseText)
							{
								alert ('Your shorten URL:\n' + request.responseText);
								return;
							}
							else
							{
								alert ("Shorten failed.. Maybe invalid key!?")
								return;
							}
						}
						else
						{
							alert ("API returned crap!");
							return;
						}
					}
					
					request.send (params);
				}
				catch (e) 
				{
					alert ("Failed to start XMLHttpRequest:\n" + e.message);
				}
				
			}
			else 
				alert ("No API-URL specified... Check your settings!");
		}
	};
} ();