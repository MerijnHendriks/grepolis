define('features/world_wonder_donations/windows/world_wonder_donations', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var WonderDonationsController = require('features/world_wonder_donations/controllers/world_wonder_donations');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.WORLD_WONDER_DONATIONS;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			height: 570,
			width: 763,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: WonderDonationsController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});
