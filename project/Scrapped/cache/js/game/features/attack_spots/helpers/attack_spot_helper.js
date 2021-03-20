/* global MM */
define('features/attack_spots/helpers/attack_spot_helper', function() {
	'use strict';

	return {
		/**
		 * returns true if current town is on a different island than the attack spot
		 * @returns {Boolean}
		 */
		isAttackSpotOnWrongIsland : function() {
			var town_collection = MM.getOnlyCollectionByName('Town'),
				attack_spot = MM.getModelByNameAndPlayerId('PlayerAttackSpot'),
				current_town = town_collection.getCurrentTown(),
				town_island_id = current_town.getIslandId(),
				attack_spot_island = attack_spot.getIslandId(),
				has_reward = attack_spot.hasReward();

			// check if current town is on same island like the attack spot AND
			// there is no reward. The reward can be claimed from all islands
			if (town_island_id !== attack_spot_island && !has_reward) {
				return true;
			}

			return false;
		}
	};

});
