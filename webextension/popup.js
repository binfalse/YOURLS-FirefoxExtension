(function _yourlsExtension() {
	
	var updateSource = function(msg) {
		var target = document.getElementById('source_url');
		while (target.firstChild)
			target.removeChild(target.firstChild);
		target.appendChild(document.createTextNode(msg));
	};
	
	var updateResult = function(msg, docopy) {
		document.getElementById('result_url').value = msg;
		if (docopy) {
			document.getElementById('result_url').select();
			document.execCommand('copy');
		}
	};
	
	var updateError = function(msg) {
		var target = document.getElementById('error');
		while (target.firstChild)
			target.removeChild(target.firstChild);
		target.innerHTML = msg;
	};
	
	
	var shorten = function (settings, long_url, keyword) {
		var options = {
			action: 'shorturl',
			format: 'simple',
			url: long_url,
			signature: settings.signature
		};
		
		if (keyword && keyword.length > 1)
			options.keyword = keyword;
		
		updateResult('Contacting server...');
		
		browser.runtime.sendMessage({method: "shortenLink", url: long_url, keyword: keyword}, function (response)
		{
			if (response.url) {
				updateResult (response.url, settings.copy);
			}
			if (response.err) {
				updateError (response.err);
			}
		}, function (error) {console.error (error)});
	}
	
	var _gotSettings = function(settings) {
		if (settings.api && settings.signature) {
			var _haveTab = function(tabs) {
				updateSource(tabs[0].url);
				
				if (settings.keyword) {
					updateResult('Waiting for keyword...');
					document.getElementById('keyword_submit').addEventListener(
						'click',
						function(se) {
							shorten (settings, tabs[0].url, document.getElementById('keyword').value);
						}
					);
				} else {
					var keywordrow = document.getElementById('keyword_row');
					keywordrow.parentNode.removeChild(keywordrow);
					updateResult('Working...');
					shorten (settings, tabs[0].url);
				}
			};
			var _tabQueryError = function(error) {
				updateSource('Cannot get current tab URL!');
				updateResult('Error:' + error.message);
			};
			browser.tabs.query({active: true, currentWindow: true}).then(_haveTab, _tabQueryError);
		} else {
			updateSource('Extension not configured');
			updateResult('Go to about:addons');
		}
	};
	var _optionsError = function(err) {
		updateSource('Options not set');
		updateResult(err.message);
	}
	
	document.getElementById('result_url').addEventListener(
		'select',
		function(se) {
			document.execCommand('Copy');
		}
	);
	
	document.getElementById('result_copy').addEventListener(
		'click',
		function(se) {
			document.getElementById('result_url').select();
			document.execCommand('copy');
		}
	);
	
	browser.storage.local.get().then(_gotSettings, _optionsError);
})();



