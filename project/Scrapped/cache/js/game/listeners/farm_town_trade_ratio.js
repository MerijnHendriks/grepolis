/* global TM, MM, Backbone */

/**
 * Listener that updates the farm town ratios for the current town on every town switch - based on trade office is available or not
 * - this is needed since the backend models do not provide a proper relation player / town / farm_town which would be needed
 *   to reflect that.
 *
 * @see GP-15673 for more details
 */
define('listeners/farm_town_trade_ratio', function(require) {
	'use strict';

	var GameEvents = require('data/events');
	var features = require('data/features');
	var BUILDINGS = require('enums/buildings');
	var GameDataFarmTowns = require('data/farm_town');

	var TIMER_NAME = 'farm_trade_ratio_listener';
	var TIMER_INTERVAL = 10000; // ms

	var FarmTownTradeRatioListener = {

		initialize : function(models, collections) {
			$.Observer(GameEvents.town.town_switch).subscribe(['farm_town_trade_ratio_listener'], this.updateTradeRatioForAllFarmTowns.bind(this));
			$.Observer(GameEvents.game.load).subscribe(['farm_town_trade_ratio_listener'], this.updateTradeRatioForAllFarmTowns.bind(this));

			if (!features.battlepointVillagesEnabled()) {
				$.Observer(GameEvents.window.farm.trade).subscribe(['farm_town_trade_ratio_listener'], this.updateTradeRatioForAllFarmTowns.bind(this));
			}

			this.farm_town_player_relation = MM.getOnlyCollectionByName('FarmTownPlayerRelation');
			this.farm_town_collection = MM.getOnlyCollectionByName('FarmTown');
			this.farm_town_player_relation.onTradeRatioChange(this, this.updateTradeRatioForAllFarmTowns.bind(this));

			TM.unregister(TIMER_NAME);
			TM.register(TIMER_NAME, TIMER_INTERVAL, function() {
				this.farm_town_player_relation.updateTradeRatioTimeDiff();
				// re-apply trade_office bonus
				this.updateTradeRatioForAllFarmTowns();
			}.bind(this));
		},

		/**
		 * check if the current town has a trade office or not
		 * and updates all farm town relation models with the current_trade_ratio
		 *
		 * Old system also notifies the map
		 */
		updateTradeRatioForAllFarmTowns : function() {
			var current_town = MM.getOnlyCollectionByName('Town').getCurrentTown(),
				buildings = current_town.getBuildings(),
				trade_office = buildings.hasBuildingWithLevel(BUILDINGS.TRADE_OFFICE, 1),
				trade_office_bonus = GameDataFarmTowns.getTradeRatioBonus(),
				bonus = trade_office ? trade_office_bonus : 0,
				island_x = current_town.getIslandX(),
				island_y = current_town.getIslandY(),
				current_island_farm_towns = this.farm_town_collection.getAllForIslandViaXY(island_x, island_y);

			// Update farm town relations for farm towns on own island non-silently
			current_island_farm_towns.forEach(function(farm_town) {
				var relation = this.farm_town_player_relation.getRelationForFarmTown(farm_town.getId());
				relation.applyTradeRatioBonus(bonus);
			}.bind(this));

			// update silent for all farm towns (includes the above 6 for simplicty)
			this.farm_town_player_relation.applyTradeRatioBonus(bonus, {
				silent: true
			});
		},

		destroy : function() {
			$.Observer(GameEvents.town.town_switch).unsubscribe(['farm_town_trade_ratio_listener']);
			$.Observer(GameEvents.game.load).unsubscribe(['farm_town_trade_ratio_listener']);
			$.Observer(GameEvents.window.farm.trade).unsubscribe(['farm_town_trade_ratio_listener']);
			this.stopListening();
			TM.unregister(TIMER_NAME);
		}
	};

	us.extend(FarmTownTradeRatioListener, Backbone.Events);

	window.GameListeners.FarmTownTradeRatioListener = FarmTownTradeRatioListener;
	return FarmTownTradeRatioListener;
});
