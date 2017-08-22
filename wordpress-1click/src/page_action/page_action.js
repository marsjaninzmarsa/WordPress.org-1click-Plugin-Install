var blogs, plugin, template, sortable;

var $blogList;

$(document).ready(function() {

	template = $('#blogs .blog-list > .blog').clone();

	$blogList = $('#blogs .blog-list');

	chrome.storage.sync.get({blogs: []}, function(obj){
		blogs = obj.blogs;
		populateFields(blogs);
	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {
		blogs = changes.blogs.newValue;
		populateFields(blogs);
	});

	sortable = $blogList.sortable({
		axis: "y",
		containment: "parent",
		// forcePlaceholderSize: true,
		items: '> .blog',
		handle: '.grip',
		opacity: .8,
		placeholder: 'placeholder',
		revert: true,
		change: makeRoom,
		stop: makeRoom
	});

	function makeRoom(e, ui) {
		console.log([e]);
// 		if(e.type == 'sortstop') {
// 			$(ui.item).siblings().css('transform', 'translate3d(0, 0, 0)');
// 		} else {
// 			$(ui.placeholder)
// 				.next(':not(.ui-sortable-helper)')
// 				.each((i, el) => {
// 					$(el).css('transform', `translate3d(0, ${100 * (i + 1)}%, 0)`);
// 				});
// 			$(ui.placeholder)
// 				.prev(':not(.ui-sortable-helper)')
// 				.css('transform', 'translate3d(0, 0, 0)');
// 		}
	}
	
	function populateFields(blogs){
		// if(!blogs.length) return;
		$blogList.empty();
		$.each(blogs, function(i,blog) {
			var $temp = template.clone();
			$temp.attr('id', `blog-${i}`).data('id', i).data('blog', blog);
			$temp.find('.blog-name').text(blog.name);
			if(blog.icon) {
				$('<img />').attr('src', blog.icon).appendTo($temp.find('.icon'));
			}
			$blogList.append($temp);
		});
		sortable.sortable('refresh');
	}

	uri = new URI(window.location);
	if(!uri.fragment()) {
		location.hash = 'blogs';
	}

	$blogList.on('click', '.blog button.install', function(e) {
		e.preventDefault();
		console.log(e, this);
	});

	$blogList.on('click','.blog button.remove',function(e){
		e.preventDefault();
		var $blog = $(this).parents('.blog');
		console.log($blog, $blog.data('blog'), $blog.data('id'));
		if(window.confirm(`Remove ${$blog.find('.blog-name').text()} from list?`)) {
			blogs.splice($blog.data('id'),1);
			chrome.storage.sync.set({ blogs: blogs },function() {
				sortable.sortable('refresh');
			});
		}
		return false;
	});

	$('#blogs button.edit, #blogs button.return').click(function(e) {
		e.preventDefault();
		edit = $('#blogs').toggleClass('edit').hasClass('edit');
		$('.blog-list').sortable('option', 'disabled', !edit);
	});
	$('#blogs button.add').click(function(e) {
		e.preventDefault();
		location.hash = 'add';
	});

	$('#blogs').on('click', '.blog-name', function(e) {
		if(!$('#blogs').hasClass('edit')) {
			return;
		}
		e.preventDefault();
		var $blog  = $(this).parents('.blog');
		var blog   = $blog.data('blog');
		var blogId = $blog.data('id');
		location.hash = 'add';
		$('#add').addClass('edit');
		$('#add form').data('id', blogId);
		$('#add form input').each(function(i, el) {
			var $el = $(el);
			$el.val(
				blog[$el.attr('name')] || ''
			);
		});
	});

	$('#add button.return').click(function(e) {
		e.preventDefault();
		location.hash = 'blogs';
		clearFormState('#add');
	});

	$('#add form').submit(function(e) {
		var form = this;
		var blog = {};
		if(form.checkValidity()) {
			e.preventDefault();
		} else {
			return false;
		}
		$(form).serializeArray().map(function(x){blog[x.name] = x.value;});

		if($('#add').hasClass('edit')) {
			id = $(form).data('id');
			blogs[id] = blog;
		} else {
			blogs.push(blog);
		}

		chrome.storage.sync.set({ blogs: blogs }, function(){
			sortable.sortable('refresh');
			location.hash = 'blogs';
		});
		clearFormState('#add');
	});

	function clearFormState(panel) {
		var $panel = $(panel);
		$panel.one('transitionend webkitTransitionEnd', () => {
			// $panel.find('input')
			// 	.val('')
			// 	.each((index, el) => {
			// 		el.setCustomValidity('');
			// 	});
			$panel.find('form')
				.data({ id: null, blog: null})
				.removeClass('edit')
				.trigger('reset');
		});
	}

	$(sortable).on('sortupdate', function(event, ui) {
		var sorted = sortable.sortable('toArray');
		var blogs = [];
		$.each(sorted, function(i, blogId) {
			var blog = $(`#${blogId}`);
			blog.data('id', i);
			blogs.push(blog.data('blog'));
		});
		chrome.storage.sync.set({ blogs: blogs }, () => {
			console.log(blogs);
		});
	});
















	//detect if we're in iframe mode
	if(uri.fragment() == 'blogs' || !uri.fragment()){
		if(uri.query()) {
			//save the plugin name from query params
			plugin = uri.search(true);
			$('.plugin-name').text(plugin.name);
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
		chrome.storage.sync.set({'blogs':blogs},function(){});
	});



	function new_win(mypage, myname, w, h, scroll, pos) {
		leftPos = (screen.availWidth) ? (screen.availWidth - w) / 2 : 50;
		topPos = (screen.availHeight) ? (screen.availHeight - h) / 2 : 50;
		settings = 'width=' + w + ',height=' + h + ',top=' + topPos + ',left=' + leftPos + ',scrollbars=' + scroll + ',location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no';
		var something = window.open(mypage, myname, settings);
		return something;
	}

});
