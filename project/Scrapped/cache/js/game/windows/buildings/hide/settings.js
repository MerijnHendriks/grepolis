/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData */

(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.HIDE;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type : type,
			minheight : 546,
			width : 820,
			tabs : [
				// This represents the tab models
				{type : tabs.INDEX, title : l10n.tabs[0], content_view_constructor : controllers.BuildingHideIndexController, hidden : true}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title.replace('- %1 (%2)', '')
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
