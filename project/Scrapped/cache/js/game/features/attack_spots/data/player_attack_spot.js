/* global Game */
define('features/attack_spots/data/player_attack_spot', function() {
	'use strict';

	return {
		getMaxLevel : function() {
			return Game.constants.player_attack_spot.max_level;
		}
	};
});
