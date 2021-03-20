/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.CRM_INTERSTITIAL;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 500,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: controllers.CrmController, hidden: true}
			],
			max_instances: 1,		// since we are using crm3 we only show one crm interstitial at a time for a display point
			activepagenr: 0,
			minimizable: false,
			is_important : true,
			title: l10n.window_title/*,
			special_buttons : {
				help : {
					action : {
						type : 'external_link',
						url : Game.event_wiki_url
					}
				}
			}*/
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
