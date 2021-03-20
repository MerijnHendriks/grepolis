/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.PHOENICIAN_SALESMAN_WELCOME;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 320,
			width: 520,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: controllers.PhoenicianSalesmanWelcomeController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));