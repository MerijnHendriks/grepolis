/**
 * @package calendar
 * @subpackage advent
 */
(function (controllers, settings) {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
        WindowSettingsHelper = require('helpers/event_window_settings');

	var type = windows.ADVENT;

    settings[type] = function (props) {
        var options = {
            tabs: [
                {type: tabs.INDEX, content_view_constructor: controllers.AdventController, hidden: true}
            ]
        };

        return WindowSettingsHelper.getEventWindowSettings(type, options, props);
    };
}(window.GameControllers, window.WindowFactorySettings));
