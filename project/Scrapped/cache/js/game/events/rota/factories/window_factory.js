define('events/rota/factories/window_factory', function (require) {
	'use strict';

	var windows = require('game/windows/ids'),
		BenefitHelper = require('helpers/benefit'),
		WF = window.WF;

	var RotaWindowFactory = {
		openWindow: function () {
			var skin = BenefitHelper.getBenefitSkin(),
				props = {
					args: {
						window_skin: skin
					}
				};

			return WF.open(windows.ROTA, props);
		}
	};

	window.RotaWindowFactory = RotaWindowFactory;

	return RotaWindowFactory;
});
