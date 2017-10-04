(function _yourlsExtension() {
    var updateSource = function(msg) {
	var target = document.getElementById('source_url');
	while (target.firstChild) target.removeChild(target.firstChild);
	target.appendChild(document.createTextNode(msg));
    };
    var updateResult = function(msg, docopy) {
	document.getElementById('result_url').value = msg;
	if (docopy) {
	    document.getElementById('result_url').select();
	    document.execCommand('copy');
	}
    };
    var _gotSettings = function(settings) {
	if (settings.api && settings.signature) {
	    var _haveTab = function(tabs) {
		updateSource(tabs[0].url);
		updateResult('Working...');
		YOURLS(settings, {
		    action: 'shorturl',
		    format: 'simple',
		    url: tabs[0].url,
		    signature: settings.signature,
		}).then(function(result) {
		    updateResult(result, true);
		}, function(error) {
		    updateResult(error ? error.message : 'Unknown error');
		});
	    };
	    var _tabQueryError = function(error) {
		updateSource('Cannot get current tab URL!');
		updateResult('Error:' + error.message);
	    };
	    browser.tabs.query({active: true, currentWindow: true}).
		then(_haveTab, _tabQueryError);
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
    browser.storage.local.get().then(_gotSettings, _optionsError);
})();
