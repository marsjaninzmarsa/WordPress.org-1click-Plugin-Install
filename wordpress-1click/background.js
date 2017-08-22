chrome.runtime.onMessage.addListener(function (msg, sender) {
	// First, validate the message's structure
	if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
		chrome.pageAction.getPopup({
			tabId: sender.tab.id
		}, function(action) {
			url = new URI(action || '');
			url.search(msg.plugin).hash('blogs');
			chrome.pageAction.setPopup({
				tabId: sender.tab.id,
				popup: url.resource()
			});
			// Enable the page-action for the requesting tab
			chrome.pageAction.show(sender.tab.id);
		});
	}
});

console.log("I'm alive in background!");
