define('features/attack_spots/factories/attack_spot', function() {
	'use strict';

	var WF = require_legacy('WF');
	var MM = require_legacy('MM');
	var WQM = require_legacy('WQM');
	var windows = require('game/windows/ids');
	var priorities = require('game/windows/priorities');

	return {
		openWindow : function() {
			var attack_spot_model = MM.getModelByNameAndPlayerId('PlayerAttackSpot');
			if (attack_spot_model.hasReward()) {
				this.openVictoryWindow();
			} else {
				this.openAttackWindow();
			}
		},

		openAttackWindow : function () {
			var window_type = windows.ATTACK_SPOT;
			WQM.addQueuedWindow({
				type : window_type,
				priority : priorities.getPriority(window_type),
				open_function : function() {
					return WF.open(window_type);
				}
			});
		},

		openVictoryWindow : function () {
			var window_type = windows.ATTACK_SPOT_VICTORY;
			WQM.addQueuedWindow({
				type : window_type,
				priority : priorities.getPriority(window_type),
				open_function : function() {
					return WF.open(window_type);
				}
			});
		}
	};
});
