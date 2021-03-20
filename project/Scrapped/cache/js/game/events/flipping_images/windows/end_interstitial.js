define('events/flipping_images/windows/end_interstitial', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		type = windows.FLIPPING_IMAGES_END_INTERSTITIAL,
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		FlippingImagesWindowFactory = require('events/flipping_images/factories/flipping_images_window_factory');

	WindowFactorySettings[type] = function(props) {
		props = props || {};

		return us.extend({
			execute: FlippingImagesWindowFactory.openWindow
		}, props);
	};

	return WindowFactorySettings[type];

});
