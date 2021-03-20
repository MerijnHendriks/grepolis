/*globals Backbone, WM, WindowViews, WindowModels, window, $, DM, Game, GameData, us */

(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');

	/**
	 * Interstitial are no real windows, but a dialog type
	 * this stub is needed for window QM
	 */
	var type = windows.INTERSTITIAL;

	settings[type] = function(props) {
		props = props || {};

		return us.extend({
			max_instances : Infinity
		}, props);

	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
