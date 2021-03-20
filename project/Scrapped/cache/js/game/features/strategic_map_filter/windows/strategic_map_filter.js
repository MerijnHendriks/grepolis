define('features/strategic_map_filter/windows/strategic_map_filter', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var StrategicMapFilterController = require('features/strategic_map_filter/controllers/strategic_map_filter');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.STRATEGIC_MAP_FILTER;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			min_height: 300,
			width: 300,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: StrategicMapFilterController, hidden: true}
			],
			max_instances: 1,
			closable: false,
			title: l10n.window_title,
			position : []
		}, props);
	};

	return WindowFactorySettings[window_type];
});