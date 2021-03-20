/* globals us, DM */
define('events/grepolympia/windows/grepolympia_welcome', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		type = windows.GREPOLYMPIA_WELCOME_INTERSTITIAL,
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		BenefitHelper = require('helpers/benefit'),
		GrepolympiaWindowFactory = require('events/grepolympia/factories/grepolympia_window_factory');

	WindowFactorySettings[type] = function(props) {
		props = props || {};
		var l10n = BenefitHelper.getl10nForSkin(DM.getl10n(type), type)[type];

		return us.extend({
			execute: GrepolympiaWindowFactory.openWindow,
			l10n : l10n
		}, props);
	};

	return WindowFactorySettings[type];

});