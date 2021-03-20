define('events/grid_event/windows/settings', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		WindowSettingsHelper = require('helpers/event_window_settings'),
		GridMainController = require('events/grid_event/controllers/grid_main'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		GRID_EVENT = windows.GRID_EVENT;

	var options = {
		tabs: [
			// This represents the tab models
			{type: tabs.INDEX, content_view_constructor: GridMainController, hidden: true}
		]
	};

	WindowFactorySettings[GRID_EVENT] = function (props) {
		return WindowSettingsHelper.getEventWindowSettings(GRID_EVENT, options, props);
	};

	return WindowFactorySettings[GRID_EVENT];
});