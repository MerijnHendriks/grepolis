define('events/flipping_images/factories/flipping_images_window_factory', function(require) {
	'use strict';

	var windows = require('game/windows/ids'),
		WF = window.WF;

	var FlippingImagesWindowFactory = {
		openWindow : function () {
			return WF.open(windows.FLIPPING_IMAGES);
		}
	};

	window.FlippingImagesWindowFactory = FlippingImagesWindowFactory;

	return FlippingImagesWindowFactory;
});