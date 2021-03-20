define('features/olympus/windows/overview_settings', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		OverviewInfoController = require('features/olympus/controllers/overview_info'),
		OverviewSmallTemplesController = require('features/olympus/controllers/overview_small_temples'),
		OverviewLargeTemplesController = require('features/olympus/controllers/overview_large_temples'),
		OverviewOlympusController = require('features/olympus/controllers/overview_olympus'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		DM = require_legacy('DM'),
		window_type = windows.OLYMPUS_OVERVIEW;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			height: 570,
			width: 832,
			tabs: [
				{type: tabs.INFO, title: l10n.tabs[0], content_view_constructor: OverviewInfoController, hidden: true},
				{type: tabs.SMALL_TEMPLES, title: l10n.tabs[0], content_view_constructor: OverviewSmallTemplesController, hidden: true},
				{type: tabs.LARGE_TEMPLES, title: l10n.tabs[0], content_view_constructor: OverviewLargeTemplesController, hidden: true},
				{type: tabs.OLYMPUS, title: l10n.tabs[0], content_view_constructor: OverviewOlympusController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});
