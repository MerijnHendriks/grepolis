/* global ReportTranslation */
(function() {
	'use strict';

	var PlayerInfo = {
		showSubCategory : function(type) {
			$('#settings_form div.section').each(function(index, node) {
				var el = $(this);
				el[el.attr('id') === 's_' + type ? 'show' : 'hide']();
			});
		},

		highlightMenuOption : function (controller, action, sub) {
			$('.settings-menu a.settings-link').each(function() {
				var el = $(this);
				el[el.attr('id') === (controller + '-' + action + (sub ? '-' + sub : '')) ? 'addClass' : 'removeClass']('selected');
			});
		},

		bindEvents : function(controller, action, sub) {
		}
	};

	window.PlayerInfo = PlayerInfo;
}());
