/*globals window, DM */

(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.SURVEY;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type : type,
			height: 546,
			width : 820,
			tabs : [
				// This represents the tab models
				{type : tabs.INDEX, content_view_constructor : controllers.SurveyController, hidden : true}
			],
			max_instances : 1,
			activepagenr : 0,
			title : l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));