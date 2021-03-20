define('events/flipping_images/windows/settings', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		FLIPPING_IMAGES = windows.FLIPPING_IMAGES,
		DM = require_legacy('DM'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		FlippingImagesController = require('events/flipping_images/controllers/main'),
		l10n = DM.getl10n(FLIPPING_IMAGES);

	var defaults = {
		window_type : FLIPPING_IMAGES,
		height : 570,
		width : 770,
		tabs : [
			// This represents the tab models
			{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: FlippingImagesController, hidden: true}
		],
		max_instances : 1,
		title : l10n.window_title
	};

	WindowFactorySettings[FLIPPING_IMAGES] = function(props) {
		props = props || {};

		return us.extend({}, defaults, props);
	};

	return WindowFactorySettings[FLIPPING_IMAGES];
});