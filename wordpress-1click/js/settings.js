var blogs = [
	{
		name : "demo-blog",
		url : "http://demo-blog.me/wp-admin"
	}
];

var plugin;


$(document).ready(function() {
	uri = new URI(window.location)
	//detect if we're in iframe mode
	if(uri.fragment() == 'buttons' || !uri.fragment()){
		if(uri.query()) {
			//save the plugin name from query params
			plugin = uri.search(true);
			$('.plugin_name').text(plugin.name);
		} else {
			chrome.tabs.query({
				active:true,
				currentWindow:true
			}, function(tabs) {
			    currentTab = tabs[0];
			    if(currentTab) {
			    	console.log(cur)
			    }
			});
		}
	}

	chrome.storage.sync.get('settings',function(obj){
		if(Object.keys(obj).length && obj.settings.length){
			blogs = obj.settings;
		}
		populateFields();
	});
	$('#submit').on('click',addNewField);
	$('#blogs').on('click','.del',function(e){
		blogs.splice($(this).parent().attr('id'),1);
		chrome.storage.sync.set({'settings':blogs},function(){});
		return false;
	});
	$('#blog_buttons').on('click','.install',function(e){
		e.preventDefault();
		url = new URI(this.href);
		url.segment('plugin-install.php').search({
			tab: 'plugin-information',
			plugin: plugin.slug,
			TB_iframe: true,
			width: 600,
			height: 550
		})
		win = new_win(url.href(),this.textContent,600,550);
	})
	$('#blogs').on('change','input',function(){
		//get the changed blog id
		var id = $(this).parent().attr('id');
		//update blogs array with changed info
		blogs[id][$(this)[0].className] = $(this).val();
		chrome.storage.sync.set({'settings':blogs},function(){});
	})
});

function populateFields(){
	if(!blogs.length) return;
	$('#blogs').find('.field').remove();
	$('#blog_buttons').empty();
	$.each(blogs,function(i,item){
		var $temp = $('.template').eq(0).clone();
			$temp.removeClass('template').addClass('field').attr('id',i)
			.find('.name').val(item.name).end()
			.find('.url').val(item.url);
		$('#blogs').append($temp);
		var $temp_btn = $('.template2').eq(0).clone();
			$temp_btn.removeClass('template2')
			.attr('data-name',item.name)
			.attr('href',item.url);
		$('#blog_buttons').append($temp_btn);
	});
}
function addNewField(e){
	e.preventDefault();
	blogs.push({
		name : "",
		url : ""
	})
	chrome.storage.sync.set({'settings':blogs},function(){

	});
	return false;
}

function new_win(mypage, myname, w, h, scroll, pos) {
	leftPos = (screen.availWidth) ? (screen.availWidth - w) / 2 : 50;
	topPos = (screen.availHeight) ? (screen.availHeight - h) / 2 : 50;
	settings = 'width=' + w + ',height=' + h + ',top=' + topPos + ',left=' + leftPos + ',scrollbars=' + scroll + ',location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no';
	var something = window.open(mypage, myname, settings);
	return something;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  blogs = changes.settings.newValue;
  populateFields();
});
