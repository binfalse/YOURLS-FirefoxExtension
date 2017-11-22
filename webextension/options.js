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
			if (document.querySelector('#api').value.length &&
				document.querySelector('#signature').value.length &&
				document.querySelector('#maxwait').value.length &&
				document.querySelector('#maxwait').value.match(/[0-9]+/)) {
				
				var settings = {};
				['api', 'signature', 'maxwait'].forEach(function(sKey) {
					settings[sKey] = document.querySelector('#'+sKey).value;
				});
				settings['keyword'] = document.querySelector('#keyword').checked;
				settings['copy'] = document.querySelector('#copy').checked;
				
				browser.runtime.sendMessage({method: "version", settings: settings}, function (response)
				{
					document.querySelector('#message').innerHTML = response.msg;
				}, function (error) {console.error (error)});
			
			} else {
				document.querySelector('#message').textContent = 'Fields missing or invalid.';
			}
		}
	};
	document.addEventListener('DOMContentLoaded', loadOptions);
	document.getElementById('button').addEventListener('click', buttonClick);
})();

