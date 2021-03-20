define('features/crm_campaign/windows/screen', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		type = windows.CRM_SCREEN,
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		CrmScreenController = require('features/crm_campaign/controllers/crm_screen');

	WindowFactorySettings[type] = function (props) {
		props = props || {};

		return us.extend({
			window_type: type,
			skin: 'crm_campaign_screen',
			minwidth: 900,
			minheight: 591,
			width: 900,
			height: 591,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, content_view_constructor: CrmScreenController, hidden: true}
			],
			max_instances: 1,		// since we are using crm3 we only show one crm screen at a time for a display point
			activepagenr: 0,
			minimizable: false,
			is_important : true
		}, props);
	};
});
