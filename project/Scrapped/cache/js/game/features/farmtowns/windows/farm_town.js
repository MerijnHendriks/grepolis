/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var FarmTownController = require('farmtowns/controllers/farm_town');

	var type = windows.FARM_TOWN;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			height: 570,
			width: 768,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: FarmTownController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
