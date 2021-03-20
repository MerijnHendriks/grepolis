define('events/missions/windows/settings', function(settings) {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		MISSIONS = windows.MISSIONS,
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		MissionsCollectionController = require('events/missions/controllers/collection'),
		MissionsController = require('events/missions/controllers/missions'),
		WindowSettingsHelper = require('helpers/event_window_settings');

	var options = {tabs: [
			// This represents the tab models
			{type : tabs.COLLECTION, content_view_constructor: MissionsCollectionController},
			{type : tabs.INDEX, content_view_constructor: MissionsController}
		]};

	WindowFactorySettings[MISSIONS] = function(props) {
		return WindowSettingsHelper.getEventWindowSettings(MISSIONS, options, props);
	};

	return WindowFactorySettings[MISSIONS];
});