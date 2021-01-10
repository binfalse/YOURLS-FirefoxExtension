(function _yourlsExtension() {
	
	var updateSource = function(msg) {
		var target = document.getElementById('source_url');
		while (target.firstChild)
			target.removeChild(target.firstChild);
		target.appendChild(document.createTextNode(msg));
	};
	
	var updateResult = function(msg, placeholder, docopy) {
		var element = document.getElementById('result_url');
		if (element) {
			element.value = msg;
			element.placeholder = placeholder;
			if (docopy) {
				element.select();
				document.execCommand('copy');
			}
		}
	};
	
	var updateError = function(error, errsupp) {
		var title = document.getElementById('message_title');
		var supp = document.getElementById('message_supp');
		title.textContent = error;
		supp.textContent = "";
		if (errsupp)
			injectSupplemental (supp, errsupp);
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
		
		updateResult("", 'Contacting server...');
		
		browser.runtime.sendMessage({method: "shortenLink", url: long_url, keyword: keyword}).then (function (response)
		{
			if (response.url) {
				updateResult (response.url, "", settings.copy);
			}
			if (response.error) {
				updateError (response.error, response.supp);
			}
		}, function (error) {updateError ("Communication error within the extension!", communicationErrorMsg);});
	}
	
	var _gotSettings = function(settings) {
		if (settings.api && settings.signature) {
			var _haveTab = function(tabs) {
				
				browser.runtime.sendMessage({method: "getLinkTarget"}).then (function (response) {
					var long_url = tabs[0].url;
					if (response.linkTarget) {
						long_url = response.linkTarget;
					}
					updateSource(long_url);
					
					document.getElementById('admin').addEventListener(
						'click',
						function(se) {
							window.open(settings.api + "admin/");
						}
					);
					
					if (settings.keyword) {
						browser.runtime.sendMessage({method: "getSelection"}).then (function (response) {
							document.getElementById('keyword').value = response.selection;
						}, function (error) {updateError ("Communication error within the extension!", communicationErrorMsg);});
						
						updateResult("", "Waiting for keyword...");
						document.getElementById('keyword_submit').addEventListener(
							'click',
							function(se) {
								shorten (settings, long_url, document.getElementById('keyword').value);
							}
						);
					} else {
						var keywordrow = document.getElementById('keyword_row');
						keywordrow.parentNode.removeChild(keywordrow);
						updateResult("", "Working...");
						shorten (settings, long_url);
					}
					
				}, function (error) {updateError ("Communication error within the extension!", communicationErrorMsg);});
			};
			var _tabQueryError = function(error) {
				updateSource('Cannot get current tab URL!');
				updateResult('Error:' + error.message, "");
			};
			browser.tabs.query({active: true, currentWindow: true}).then(_haveTab, _tabQueryError);
		} else {
			updateSource('Extension not configured');
			updateResult('Go to about:addons', "");
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
	
	
	
	
	document.getElementById('settings').addEventListener(
		'click',
		function(se) {
			browser.runtime.openOptionsPage();
		}
	);
	
	browser.storage.local.get().then(_gotSettings, _optionsError);
})();



