define('events/spawn/windows/spawn_window', function(settings) {
    'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var SpawnWindowController = require('events/spawn/controllers/spawn_window');
    var WindowFactorySettings = require_legacy('WindowFactorySettings');
    var WindowSettingsHelper = require('helpers/event_window_settings');
    var BenefitTypes = require('enums/benefit_types');

	var window_id = windows.SPAWN;

    WindowFactorySettings[window_id] = function (props) {
    	var options = {
                tabs: [
                    // This represents the tab models
                    {type: tabs.INDEX, content_view_constructor: SpawnWindowController, hidden: true}
                ],
                benefit_type: BenefitTypes.SPAWN
            };

        return WindowSettingsHelper.getEventWindowSettings(window_id, options, props);
	};

    return WindowFactorySettings[window_id];
});
