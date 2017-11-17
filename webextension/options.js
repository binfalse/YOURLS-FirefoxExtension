(function _yourlsOptions () {
		var loadOptions = function(e) {
			browser.storage.local.get().then(function _gotOptions(result) {
					document.querySelector('#api').value = result.api || '';
					document.querySelector('#signature').value = result.signature || '';
					document.querySelector('#maxwait').value = result.maxwait || '';
			});
		};
		var buttonClick = function(e) {
			if (e && e.target) {
					e.preventDefault();
					if (document.querySelector('#api').value.length &&
							document.querySelector('#signature').value.length &&
							document.querySelector('#maxwait').value.length &&
							document.querySelector('#maxwait').value.match(/[0-9]+/)) {
						var settings = {};
						['api', 'signature', 'maxwait'].forEach(function(sKey) {
								settings[sKey] = document.querySelector('#'+sKey).value;
						});
						YOURLS(settings,
									{
								action: 'version',
								signature: settings.signature,
									},
									'^.*<version>\\d+\\.\\d+.*<\\/version>.*$'
									).then(function(result) {
								browser.storage.local.set(settings);
								alert('Success.  Configuration Saved.');
									}, function(error) {
								alert('Error: ' + error.message);
									});
							} else {
						alert('Fields missing or invalid.');
					}
			}
		};
		document.addEventListener('DOMContentLoaded', loadOptions);
		document.querySelector('#button').addEventListener('click', buttonClick);
})();
