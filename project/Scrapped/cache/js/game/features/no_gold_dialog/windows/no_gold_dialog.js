/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var NoGoldDialogController = require('no_gold_dialog/controllers/no_gold');

	var type = windows.NO_GOLD_DIALOG;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type);

		return us.extend({
			window_type: type,
			height: 349,
			width: 561,
			minimizable: false,
			modal: true,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: NoGoldDialogController, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
