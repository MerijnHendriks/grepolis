/*globals us, PremiumWindowFactory */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');

	var type = windows.PREMIUM;

	settings[type] = function (props) {
		props = props || {};

		return us.extend({
			window_type: type,
			execute : function() {
				return PremiumWindowFactory.openBuyGoldWindow();
			}
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
