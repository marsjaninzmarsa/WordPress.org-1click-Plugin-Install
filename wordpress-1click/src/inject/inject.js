console.log("I'm alive!");

//need to get the slug of the extension
var plugins = $('article.plugin');
var plugin_data;
plugins.each(function(index, plugin) {
	plugin_header = $(plugin).find('h1.plugin-title, h2.entry-title');
	plugin_data = {
		url: plugin_url = $(plugin_header).find('a').attr('href'),
		name: $(plugin_header).text(),
		slug: extractPluginSlug(plugin_url),
	};
	link = $(plugin).find('a.plugin-download');
	if(link.length) {
		$(plugin).find('.button-primary.button-install').remove();
		$('<a href="#">Install</a>')
			.addClass([
				'button',
				'button-large',
				'button-primary',
				'button-install'
			].join(' '))
			.data('plugin', plugin_data)
			.click(clickHandler)
			.insertAfter(link);
		$(link)
			.addClass('button-secondary')
			.removeClass('download-button');
	}
});

if(plugins.length == 1) {
	chrome.runtime.sendMessage({
	  from:    'content',
	  subject: 'showPageAction',
	  plugin:  plugin_data
	});
}

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
var cssUrl = chrome.extension.getURL('src/inject/inject.css');
style.href = cssUrl;
// (document.head||document.documentElement).appendChild(style);

$('#oneclick_overlay').remove();
$(`
	<div id="oneclick_overlay" class="overlay" hidden>
		<div id="oneclick_iframe_container">
			<iframe id="oneclick_iframe" width=100% height=100% frameborder=0></iframe>
		</div>
		<!-- <link rel="stylesheet" href="${cssUrl}" /> -->
	</div>
`).click(removeOverlay)
.appendTo('body');

function extractPluginSlug(url) {
	regex = /https:\/\/(?:(?:\w{2}|downloads)\.)?wordpress\.org\/plugins?\/(\w+(?:-\w+)*)(?:\/|[\d.]*\.zip)/;
	return url.match(regex)[1] || null;
}

function clickHandler(e){
	e.preventDefault();
	plugin = $(this).data('plugin');
	iframe = $('#oneclick_iframe');
	console.log(plugin, iframe);
	src = chrome.extension.getURL('src/page_action/page_action.html') + '?' + $.param(plugin) + "#buttons";
	$(iframe).attr('src', src);
//	setts.child = new_win(url + "/plugin-install.php?tab=plugin-information&plugin=" + plugin_name +"&TB_iframe=true&width=600&height=550",'new_win',600,550);

	$('#oneclick_overlay').prop('hidden', false).addClass('show')
}

function removeOverlay(){
	var overlay = $('#oneclick_overlay').removeClass('show');
	setTimeout(function() {
		$(overlay).prop('hidden', true);
	}, 1000)
}
