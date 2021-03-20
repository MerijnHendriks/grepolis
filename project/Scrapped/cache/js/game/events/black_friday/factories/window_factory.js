define('events/black_friday/factories/window_factory', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		WF = window.WF;

	var BlackFridayWindowFactory = {
		openWindow: function () {
			return WF.open(windows.BLACK_FRIDAY_SALE);
		}
	};

	window.BlackFridayWindowFactory = BlackFridayWindowFactory;

	return BlackFridayWindowFactory;
});