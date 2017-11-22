function YOURLS(settings, options, expected) {
		var expMatchString = expected || '^\\s*(\\S+)\\s*$';
		var apiURLwSlash = settings.api;
		if (apiURLwSlash.substr(-1) != '/')
			apiURLwSlash += '/';
		var apiURL = apiURLwSlash + 'yourls-api.php';
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
							var msg = "<strong>Error: Server returned status " + xhr.status + " (" + xhr.statusText + ")</strong>";
							
							switch (xhr.status)
							{
								case 403:
									msg += "<br>Seems like you are not allowed to access the API. Did you provide a correct signature? Please verify at <a href='" + apiURLwSlash + "admin/tools.php'>" + apiURLwSlash + "admin/tools.php</a> and double check the signature token. ";
									break;
								case 404:
									msg += "<br>Seems like we cannot find an YOURLS API at " + apiURL + "? Did you provide the correct API URL? Do not add the 'yourls-api.php' as we will do that! ";
									break;
							}
							
							reject (new Error (msg));
						}
					}
			};
			
			xhr.open('POST', apiURL, true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send(qParams);
		});
}

