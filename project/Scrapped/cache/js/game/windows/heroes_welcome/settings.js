/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData */

(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.HEROES_WELCOME;

	settings[type] = function(props) {
		props = props || {};

		// we inherit the translatioms from "main" heroes
		var l10n = DM.getl10n(windows.HEROES, type);

		return us.extend({
			window_type : type,
			width : 820,
			minheight : 519,
			skin: 'wnd_skin_column',
			tabs : [
				// This represents the tab models
				{type : tabs.WELCOME, title : '', content_view_constructor : controllers.HeroesWelcomeController, hidden : true}
			],
			max_instances : 1,
			minimizable : false,
			closable : false,
			title : l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));