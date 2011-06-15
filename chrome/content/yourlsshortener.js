var YOURLSshortener = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		gohome : function () {
				var api = prefManager.getCharPref("extensions.yourls-shortener.api");
				if (api.substr(-1) != '/')
					api += '/';
				window.open(api + "admin/");
				return;
		},
		run : function (long) {
			if (!long)
			{
				alert ("lost my URL!?");
				return;
			}
			
			var error = null;
			var api = prefManager.getCharPref("extensions.yourls-shortener.api");
			if (api.substr(-1) != '/')
				api += '/';
			api += "yourls-api.php";
			
			if (api && api != 'http://yoursite/')
			{
				try
				{
					var params = 'action=shorturl&format=simple&url=' + long + '&signature=' + prefManager.getCharPref("extensions.yourls-shortener.signature");
					
					if (prefManager.getBoolPref("extensions.yourls-shortener.askforkey"))
					{
						var sel = "";
						try
						{
							sel = content.getSelection() + "";
						}
						catch (e) {}
						
						var key = prompt("Type your keyword here (leave empty to generate)", sel.toLowerCase ());
						if (key)
							params += '&keyword=' + key;
					}
					
					var request = new XMLHttpRequest();
					request.open("POST", api, false);
					request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					request.setRequestHeader("Content-length", params.length);
					request.setRequestHeader("Connection", "close");
					request.send(params);
					if (request.status == 200 || request.status == 201)
					{
						if ()
						{
							alert ('Your shorten URL:\n' + request.responseText);
							return;
						}
						else
							error = "Shorten failed.. Maybe invalid key!?"
					}
					else
						error = "API returned crap!";
				}
				catch (e) 
				{
					error = "Failed to start XMLHttpRequest:\n" + e.message;
				}
				
			}
			else 
				error = "No API-URL specified... Check your settings!";
			
			if (error)
				alert (error);
		}
	};
}();