define('events/black_friday/windows/settings', function(require) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var BlackFridayController = require('events/black_friday/controllers/black_friday');
	var WindowSettingsHelper = require('helpers/event_window_settings');

	var window_id = windows.BLACK_FRIDAY_SALE;

	WindowFactorySettings[window_id] = function(props) {
		var options = {
			window_settings: {
				minheight: 394,
				minwidth: 692,
				max_instances: 1,
				minimizable: false,
				special_buttons: {}
			},
			tabs: [{
				type: tabs.INDEX,
				content_view_constructor: BlackFridayController,
				hidden: true
			}]
		};

		return WindowSettingsHelper.getEventWindowSettings(window_id, options, props);
	};

	return WindowFactorySettings[window_id];
});