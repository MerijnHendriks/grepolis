define('events/crafting/windows/easter_collect', function(require) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var HelperEaster = require('events/crafting/helpers/easter');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var EasterCollectController = require('events/crafting/controllers/easter_collect');

	var type = windows.EASTER_COLLECT;

	WindowFactorySettings[type] = function(props) {
		props = props || {};

		var l10n = HelperEaster.getEasterCollectl10nForSkin();

		return us.extend({
			window_type : type,
			width : 616,
			minheight : 497,
			tabs : [
				// This represents the tab models
				{type : tabs.INDEX, title : '', content_view_constructor : EasterCollectController, hidden : true}
			],
			max_instances : 1,
			minimizable : false,
			closable : true,
			title : l10n.window_title
		}, props);
	};

	return WindowFactorySettings[type];
});