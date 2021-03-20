(function () {
	'use strict';

	var windows = require('game/windows/ids'),
        BenefitHelper = require('helpers/benefit'),
		WF = window.WF;

	var AssassinsWindowFactory = {
		/**
		 * Opens 'Assassins' window - default tab
		 */
		openWindow : function (shop_only) {
			var skin = BenefitHelper.getBenefitSkin();

			return WF.open(shop_only ? windows.ASSASSINS_SHOP : windows.ASSASSINS,
				{
					args: {
						window_skin: skin
					}
            	}
            );


		}
	};

	window.AssassinsWindowFactory = AssassinsWindowFactory;
}());
