/* global WF */

define('events/spawn/window_factory', function() {
	'use strict';

	var ids = require('game/windows/ids');
    var BenefitHelper = require('helpers/benefit');
    var BenefitTypes = require('enums/benefit_types');

	return {
		openWindow : function(spawn_model) {
			var skin = BenefitHelper.getBenefitSkin(BenefitTypes.SPAWN);

			WF.open(ids.SPAWN, {
				models : {
					spawn : spawn_model
				},
				args:
				{
					window_skin: skin
				}
			});
		}
	};
});