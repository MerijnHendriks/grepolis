/* globals us, WindowFactorySettings */
define('events/spawn/windows/spawn_welcome', function(settings) {
    'use strict';

	var windows = require('game/windows/ids');

	var type = windows.SPAWN_WELCOME;

    WindowFactorySettings[type] = function (props) {
		props = props || {};

		return us.extend({
			//window_settings are used like that only for interstitial window genrated in InterstitialWindowFactory
			window_settings : {
				width : 877
			},
			execute: function() {

			}
		}, props);
	};

    return WindowFactorySettings[type];
});
