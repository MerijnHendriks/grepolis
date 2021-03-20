/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData, us */

(function(controllers, collections, models, settings, identifiers) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.PLACE;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type : type,
			minheight : 578,
			width : 820,
			tabs : [
				// This represents the tab models
				{type : tabs.SUPPORT_OVERVIEW_ACTIVE_PLAYER_SUPPORTS_TOWN, title : l10n.tabs[0], content_view_constructor : controllers.SupportOverviewController}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));