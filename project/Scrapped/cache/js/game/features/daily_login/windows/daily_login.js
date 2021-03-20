define('features/daily_login/windows/daily_login', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var DailyLoginController = require('features/daily_login/controllers/daily_login');
	var window_type = windows.DAILY_LOGIN;
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			minheight: 527,
			width: 664,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: DailyLoginController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});
