/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');

	var type = windows.HERCULES2014_COLLECT;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			minheight: 570,
			width: 771,
			tabs: [
				// This represents the tab models
				{type: tabs.INDEX, title: null, content_view_constructor: controllers.Hercules2014CollectController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
