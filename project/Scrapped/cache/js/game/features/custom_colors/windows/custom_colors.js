define('features/custom_colors/windows/custom_colors', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var CustomColorsController = require('features/custom_colors/controllers/custom_colors');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.CUSTOM_COLORS;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			min_height: 330,
			width: 520,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: CustomColorsController, hidden: true}
			],
			max_instances: 1,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});