/*globals us, PremiumWindowFactory */

/**
 * @package windows
 * @subpackage premium_package_tab
 */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');

	var type = windows.PREMIUM_PACKAGE_TAB;

	settings[type] = function (props) {
		props = props || {};

		return us.extend({
			window_type: type,
			execute : function() {
				return PremiumWindowFactory.openBuyGoldWindow(true, true);
			}
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
