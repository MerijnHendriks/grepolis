define('events/grid_event/data/battleships', function() {
	'use strict';

	var BattleshipsData = {
		/**
		 * Retrieves the named tooltip translation index based on the current state
		 *
		 * @param {String} grid_state
		 * @param {Boolean} can_take_turn
		 * @param {Number} reward_quantity_multiplier
		 * @returns {String}
		 */
		getTooltipTranslationIndex: function(grid_state, can_take_turn, reward_quantity_multiplier) {
			switch (grid_state) {
				case 'scouting':
					return 'scouting';
				case 'blocked_inventory':
					return 'blocked_inventory';
				case 'turn_available':
					return BattleshipsData.getTurnAvailableTooltipTranslationIndex(
						can_take_turn,
						reward_quantity_multiplier
					);
			}

			return '';
		},

		/**
		 * Retrieves the named tooltip translation index for a turn available based on whether the player can take
		 * a turn currently and the reward multiplier
		 *
		 * @param {Boolean} can_take_turn
		 * @param {Number} reward_quantity_multiplier
		 * @returns {String}
		 */
		getTurnAvailableTooltipTranslationIndex: function(can_take_turn, reward_quantity_multiplier) {
			if (can_take_turn === true) {
				if (reward_quantity_multiplier === 1) {
					return 'turn_available';
				} else {
					return 'multiplier_turn_available';
				}
			} else {
				return 'turn_unavailable';
			}
		}
	};

	return BattleshipsData;
});