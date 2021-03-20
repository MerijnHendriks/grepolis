/* global WF */

define('events/town_overlay/factories/town_overlay', function () {
    'use strict';

    var windows = require('game/windows/ids'),
        BenefitHelper = require('helpers/benefit'),
        BenefitTypes = require('enums/benefit_types');

    return {
        openWindow: function () {
			var skin = BenefitHelper.getBenefitSkin(BenefitTypes.TOWN_OVERLAY);
            WF.open(windows.TOWN_OVERLAY, {
				args:
				{
					window_skin: skin
				}
            });
        }
    };
});