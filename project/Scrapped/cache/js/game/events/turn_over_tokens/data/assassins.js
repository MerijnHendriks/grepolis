/* global us */
(function() {
	'use strict';

	var GameData = window.GameData;

	var GameDataAssassins = {
		/**
		 * get all tier
		 *
		 * @returns {Array}
		 */
		getTiers : function() {
			return GameData.events.assassins.tiers;
		},

		getTotalPointsOfAllTiers: function() {
			return us.reduce(this.getTiers(), function(sum, tier) {
				return sum  + tier.amount * tier.points;
			}, 0);
		},

		getArrowCost : function() {
			return GameData.events.assassins.premium.buy_arrows_costs;
		},

		getArrowNum : function() {
			return GameData.events.assassins.premium.buy_arrows_amount;
		},

		getSpotsResetCost : function() {
			return GameData.events.assassins.premium.spots_reset_costs;
		}

	};

	window.GameDataAssassins = GameDataAssassins;
}());