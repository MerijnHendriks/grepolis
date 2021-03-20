/*globals Game*/
(function() {
	'use strict';

	var BrowserHelper = require('helpers/browser');

	function resizeTab(ele){
		if (!ele){
			return;
		}

		var offset = 26,
			tab_height = parseInt(ele.find('ul.game_tab_list').outerHeight(), 10),
			container = ele.find('div.ui-tabs-panel:visible').children().first();

		for (var prop_id in {'maxHeight':'', 'height':''}){ // jshint ignore:line
			var foo = container.css(prop_id);

			if (foo) {
				var new_height = 'auto';

				foo = parseInt(foo, 10);

				if (!isNaN(foo)) {
					new_height = Math.abs(foo - (tab_height - offset));
				}

				container.css({i: new_height });
				return;
			}
		}
	}

	var Tabs = function(id){
		this.el = $('#' + id).tabs({
			spinner : '',
			ajaxOptions: {
				success: function(){},
				error: function(){},
				data: {h:Game.csrfToken}
			},
			cache: false,
			show: function(){
				resizeTab($(this));
				if(BrowserHelper.isIE()){
					$(this).parents('td').hide().show();
				}
			},
			load: function(){
				resizeTab($(this));
				if(BrowserHelper.isIE()){
					$(this).parents('td').hide().show();
				}
			}

		});
	};

	window.Tabs = Tabs;
}());