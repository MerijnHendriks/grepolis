define('features/color_picker/windows/color_picker', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var ColorPickerController = require('features/color_picker/controllers/color_picker');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.COLOR_PICKER;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			height: 250,
			width: 250,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: ColorPickerController, hidden: true}
			],
			max_instances: 1,
			minimizable: false,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});