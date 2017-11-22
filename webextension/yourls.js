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
								reject (new Error ('<strong>Invalid response from Server: ' + xhr.responseText + "</strong>"));
							}
						} else {
							var msg = "<strong>Error: Server returned status " + xhr.status + " (" + xhr.statusText + ")</strong>";
							
							switch (xhr.status)
							{
								case 403:
									msg += "<br>Seems like you are not allowed to access the API. Did you provide a correct signature? Please verify at <a href='" + apiURLwSlash + "admin/tools.php'>" + apiURLwSlash + "admin/tools.php</a> and double check the signature token.";
									break;
								case 404:
									msg += "<br>Seems like we cannot find an YOURLS API at <a href='" + apiURL + "'>" + apiURL + "</a>? Did you provide the correct API URL? You should be able to access the admin interface at <a href='" + apiURLwSlash + "admin'>" + apiURLwSlash + "admin</a>!? Do not append <code>'yourls-api.php'</code>, as we will do that!";
									break;
								case 0:
									msg += "<br>Experienced a general connection issue... Maybe your SSL certificate is not valid? Your server is down? Please make sure that you can access the admin interface at <a href='" + apiURLwSlash + "admin'>" + apiURLwSlash + "admin</a>. Open a new ticket at <a href='https://github.com/binfalse/YOURLS-FirefoxExtension/issues'>the GitHub project</a> if you need further help.";
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

