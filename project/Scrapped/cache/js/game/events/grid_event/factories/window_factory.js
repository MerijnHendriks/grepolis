define('events/grid_event/factories/window_factory', function (require) {
	'use strict';

	var windows = require('game/windows/ids'),
		BenefitHelper = require('helpers/benefit'),
		WF = window.WF;

	var GridEventWindowFactory = {
		openWindow: function () {
			var skin = BenefitHelper.getBenefitSkin(),
				props = {
					args: {
						window_skin: skin
					}
				};

			return WF.open(windows.GRID_EVENT, props);
		}
	};

	window.GridEventWindowFactory = GridEventWindowFactory;

	return GridEventWindowFactory;
});
