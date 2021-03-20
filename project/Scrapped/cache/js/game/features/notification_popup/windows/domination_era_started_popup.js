// Settings for the Domination Era Started Notification Popup Window
/* global us */
define('features/notification_popup/windows/domination_era_started_popup', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		NotificationPopupController = require('features/notification_popup/controllers/notification_popup'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
		DM = require_legacy('DM'),
		window_type = windows.DOMINATION_ERA_STARTED;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			window_type: window_type,
			minheight: 560,
			width: 692,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: NotificationPopupController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});