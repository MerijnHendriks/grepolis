/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.SPECIAL_OFFER;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 498,
			width: 690,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: controllers.SpecialOfferController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			minimizable: false,
			is_important : true,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
