(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
    var WindowSettingsHelper = require('helpers/event_window_settings');

	var type = windows.VALENTINESDAY_COLLECT;

	settings[type] = function (props) {
        var options = {
                tabs: [
                    // This represents the tab models
                    {type: tabs.INDEX, content_view_constructor: controllers.ValentinesDayCollectController, hidden: true}
                ],
                window_settings: {
                    special_buttons: {}
                }
            };

        return WindowSettingsHelper.getEventWindowSettings(type, options, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
