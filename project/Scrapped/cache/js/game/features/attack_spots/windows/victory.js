define('features/attack_spots/windows/victory', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var AttackSpotVictoryController = require('features/attack_spots/controllers/victory');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.ATTACK_SPOT_VICTORY;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			height: 424,
			width: 565,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: AttackSpotVictoryController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});
