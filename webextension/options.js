(function _yourlsOptions () {
	
	var loadOptions = function(e) {
		browser.storage.local.get().then(function _gotOptions(result) {
			document.querySelector('#api').value = result.api || '';
			document.querySelector('#signature').value = result.signature || '';
			document.querySelector('#maxwait').value = result.maxwait || '4';
			document.querySelector('#keyword').checked = result.keyword || false;
			document.querySelector('#copy').checked = result.copy || false;
		}, function _err () {
			document.querySelector('#message').textContent = 'Could not load settings.';
		}
		);
	};
	var buttonClick = function(e) {
		if (e && e.target) {
			e.preventDefault();
			
			var msg_title = document.querySelector('#message_title');
			var msg_supp = document.querySelector('#message_supp');
			msg_title.textContent = "";
			while (msg_supp.firstChild)
				msg_supp.removeChild(msg_supp.firstChild);
			
			if (document.querySelector('#api').value.length &&
				document.querySelector('#signature').value.length) {
				
				var settings = {};
				['api', 'signature', 'maxwait'].forEach(function(sKey) {
					settings[sKey] = document.querySelector('#'+sKey).value;
				});
				settings['keyword'] = document.querySelector('#keyword').checked;
				settings['copy'] = document.querySelector('#copy').checked;
				
				settings['maxwait'] = parseInt(settings['maxwait']);
				if (!settings['maxwait'] || settings['maxwait'] < 1) {
					settings['maxwait'] = 5;
				}
				document.querySelector('#maxwait').value = settings['maxwait'];
				
				browser.runtime.sendMessage({method: "version", settings: settings}, function (response)
				{
					if (!response.error) {
						msg_title.textContent = "Success!";
						msg_supp.textContent = "You're connected to a YOURLS version " + response.url;
					} else {
						msg_title.textContent = response.error;
						if (response.supp) {
							injectSupplemental (msg_supp, response.supp);
						}
					}
				}, function (error) {
					msg_title.textContent = "Communication error within the extension!";
					injectSupplemental (msg_supp, communicationErrorMsg);
				});
			
			} else {
				msg_title.textContent = 'Please provide a proper API URL and your signature.';
				msg_supp.textContent = 'The Server URL is the URL to the YOURLS web interface. The signature can be obtained from the "Tools" page of the YOURLS web interface.';
			}
		}
	};
	document.addEventListener('DOMContentLoaded', loadOptions);
	document.getElementById('button').addEventListener('click', buttonClick);
})();

