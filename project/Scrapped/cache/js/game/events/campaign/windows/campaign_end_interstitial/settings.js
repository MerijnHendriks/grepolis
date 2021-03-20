/*globals us */

(function (settings) {
	'use strict';

	var windows = require('game/windows/ids');

	var type = windows.HERCULES2014_END_INTERSTITIAL;

	settings[type] = function (props) {
		props = props || {};

		return us.extend({
			execute: window.Hercules2014WindowFactory.openWindow
		}, props);
	};
}(window.WindowFactorySettings));