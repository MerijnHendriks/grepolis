define('features/olympus/windows/temple_info_settings', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		TempleInfoController = require('features/olympus/controllers/temple_info'),
		TempleDefenseController = require('features/olympus/controllers/temple_defense'),
		RankingController = require('features/olympus/controllers/ranking'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		DM = require_legacy('DM'),
		window_type = windows.OLYMPUS_TEMPLE_INFO;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			height: 570,
			width: 832,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: TempleInfoController, hidden: false},
				{type: tabs.TEMPLE_DEFENSE, title: l10n.tabs[1], content_view_constructor: TempleDefenseController, hidden: false},
				{type: tabs.RANKING, title: l10n.tabs[2], content_view_constructor: RankingController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});
