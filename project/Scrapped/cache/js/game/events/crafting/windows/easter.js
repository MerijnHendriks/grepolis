define('events/crafting/windows/easter', function(require) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var EasterAlchemyController = require('events/crafting/controllers/easter_alchemy');
	var EasterRecipesController = require('events/crafting/controllers/easter_recipes');
	var WindowSettingsHelper = require('helpers/event_window_settings');

	var window_id = windows.EASTER;

	WindowFactorySettings[window_id] = function(props) {
		var options = {
            tabs: [
                // This represents the tab models
                {type: tabs.ALCHEMY, content_view_constructor : EasterAlchemyController},
                {type: tabs.RECIPES, content_view_constructor : EasterRecipesController}
            ]
        };

		return WindowSettingsHelper.getEventWindowSettings(window_id, options, props);
	};

	return WindowFactorySettings[window_id];
});