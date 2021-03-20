define('events/grepolympia/factories/grepolympia_window_factory', function(require) {
	'use strict';

	var windows = require('game/windows/ids'),
		GREPOLYMPIA = require('enums/happenings').GREPOLYMPIA,
		MM = window.MM,
		WF = window.WF,
		eventTracking = window.eventTracking,
		BenefitHelper = require('helpers/benefit'),
		EVENT_SCREEN = require('enums/json_tracking').EVENT_SCREEN;

	var GrepolympiaWindowFactory = {
		/**
		 * Opens 'Grepolympia' window - default tab
		 */
		openWindow : function () {
			var benefitsCollection = MM.getOnlyCollectionByName('Benefit');
			var shop_only = benefitsCollection.getRunningBenefitsOfType('grepolympia_discipline').length === 0;
			var skin = BenefitHelper.getBenefitSkin();

			eventTracking.logJsonEvent(EVENT_SCREEN, {
				'screen_name': shop_only ? 'grepolympia_shop_only' : 'grepolympia',
				'action': 'open',
				'ingame_event_name': GREPOLYMPIA
			});

			return WF.open(shop_only ? windows.GREPOLYMPIA_SHOP : windows.GREPOLYMPIA,
				{ args:
					{
						window_skin: skin
					}
				}
			);
		}
	};

	window.GrepolympiaWindowFactory = GrepolympiaWindowFactory;

	return GrepolympiaWindowFactory;
});
