/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData */

/**
 * ========================
 *         BARRACKS
 * ========================
 */
(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.BARRACKS;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type : type,
			minheight : Game.isSmallScreen() ? 366 : 546,
			width : 820,
			tabs : [
				// This represents the tab models
				{type : tabs.INDEX, title : l10n.tabs[0], content_view_constructor : controllers.BarracksController, hidden : true}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));

/**
 * ========================
 *           DOCKS
 * ========================
 */
(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.DOCKS;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(windows.BARRACKS);

		return us.extend({
			window_type : type,
			minheight : Game.isSmallScreen() ? 269 : 533,
			width : 820,
			tabs : [
				// This represents the tab models
				{type : tabs.INDEX, title : l10n.tabs[0], content_view_constructor : controllers.BarracksController, hidden : true}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));