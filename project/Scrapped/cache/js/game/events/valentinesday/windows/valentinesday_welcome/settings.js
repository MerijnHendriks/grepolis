/*globals us, DM, MM, Game */

/**
 * @package events
 * @subpackage valentinesday
 */
(function (settings) {
	'use strict';

	var windows = require('game/windows/ids');

	var type = windows.VALENTINESDAY_WELCOME;

	settings[type] = function (props) {
		var mermaid_model = MM.getModels().Mermaid[Game.player_id];
		props = props || {};

		return us.extend({
			//window_settings are used like that only for interstitial window generated in InterstitialWindowFactory
			window_settings : {
				width : 877
			},
			execute: function() {

			},
			l10n: DM.getl10n(type).welcome_screen(mermaid_model.getEndDateNice(), mermaid_model.getMaxResources()),
			ignore_benefit_skin: true
		}, props);
	};
}(window.WindowFactorySettings));
