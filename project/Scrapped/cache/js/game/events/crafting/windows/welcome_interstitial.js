/*globals us, EasterWindowFactory */

define('events/crafting/windows/welcome_interstitial', function(require) {
	'use strict';

	var windows = require('game/windows/ids');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var HelperEaster = require('events/crafting/helpers/easter');

	var type = windows.EASTER_WELCOME;

	WindowFactorySettings[type] = function (props) {
		props = props || {};

		var l10n = HelperEaster.getInterstitialSkinl10n(type);

		return us.extend({
			execute: function() {
				EasterWindowFactory.openEasterWindow();
			},
			l10n: l10n.welcome_screen
		}, props);
	};
	return WindowFactorySettings[type];
});
