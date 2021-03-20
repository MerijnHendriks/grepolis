/* global DM, us, Game */

(function (controllers, collections, models, settings, identifiers) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var window_controller = require('events/campaign/controllers/campaign');

	var type = windows.HERCULES2014;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			height: 580,
			width: 771,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: null, content_view_constructor: window_controller, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title,
			special_buttons : {
				help : {
					action : {
						type : 'external_link',
						url : Game.event_wiki_url
					}
				}
			}
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
