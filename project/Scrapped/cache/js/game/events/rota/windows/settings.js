define('events/rota/windows/settings', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		WindowSettingsHelper = require('helpers/event_window_settings'),
		RotaController = require('events/rota/controllers/rota'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		ROTA = windows.ROTA;

	var options = {
		tabs: [
			// This represents the tab models
			{type: tabs.INDEX, content_view_constructor: RotaController, hidden: true}
		],
		window_settings: {
			minwidth: 850
		}
	};

	WindowFactorySettings[ROTA] = function (props) {
		return WindowSettingsHelper.getEventWindowSettings(ROTA, options, props);
	};

	return WindowFactorySettings[ROTA];
});