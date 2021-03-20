/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.GIFTS_WELCOME;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 498,
			width: 690,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: controllers.GiftsWelcomeController, hidden: true}
			],
			max_instances: 10,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
