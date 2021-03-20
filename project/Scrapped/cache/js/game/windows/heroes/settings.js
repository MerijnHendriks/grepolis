/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData */

(function() {
	'use strict';

	var controllers = window.GameControllers;
	var settings = window.WindowFactorySettings;
	var GameDataFeatureFlags = require('data/features');

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.HEROES;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(type);
		var OverviewController = GameDataFeatureFlags.isInstantBuyEnabled() ?
			controllers.HeroesOverviewInstantBuyController : controllers.HeroesOverviewHalvingTimeController;

		return us.extend({
			window_type : type,
			height : 570,
			width : 770,
			tabs : [
				// This represents the tab models
				{type : tabs.OVERVIEW, title : l10n.tabs[0], content_view_constructor : OverviewController},
				{type : tabs.COUNCIL, title : l10n.tabs[3], content_view_constructor : controllers.HeroesCouncilController},
				{type : tabs.COLLECTION, title : l10n.tabs[4], content_view_constructor : controllers.HeroesCollectionController}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title,
			special_buttons : {
				help : {
					action : {
						type : "external_link",
						url : Game.hero_wiki_url
					}
				}
			}
		}, props);
	};
}());
