/*globals us, DM, GameData */

(function (controllers, collections, models, settings) {
	'use strict';


	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var type = windows.UPDATE_NOTIFICATION;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 561,
			width: 692,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: controllers.UpdateNotificationController, hidden: true}
			],
			max_instances: 1,
			minimizable: false,
			closable: false,
			modal: true,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings, GameData.windows_factory));
