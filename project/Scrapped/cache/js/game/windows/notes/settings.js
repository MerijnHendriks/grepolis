/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.NOTES;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		var note_tabs = [];

		for (let i = 1; i <= Game.constants.notes.max_notes; i++) {
			var note_type = tabs.NOTE + i;
			note_tabs.push({type: note_type, title: l10n.tabs[0], content_view_constructor: controllers.NotesController, hidden: true});
		}

		return us.extend({
			window_type: type,
			minheight: 401,
			width: 777,
			tabs: note_tabs,
			max_instances: 1,
			activepagenr: 0,
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
