/*global us */

define('farmtowns/collections/farm_town_player_relations', function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var FarmTownPlayerRelation = require('farmtowns/models/farm_town_player_relation');

	var FarmTownPlayerRelations = {

		model : FarmTownPlayerRelation,
		model_class : 'FarmTownPlayerRelation',

		getRelationForFarmTown : function(farm_town_id) {
			return this.findWhere({ farm_town_id : farm_town_id });
		},

		getAmountOfOwnedFarmTowns : function() {
			return this.where({ relation_status : 1}).length;
		},

		onFarmTownRelationStatusChange : function(obj, callback) {
			obj.listenTo(this, 'change:relation_status', callback);
		},

		onTradeRatioChange : function(obj, callback) {
			obj.listenTo(this, 'change:trade_ratio', callback);
		},

		onExpansionStageChange: function(obj, callback) {
			obj.listenTo(this, 'change:expansion_stage', callback);
		},

		onRatioUpdate : function(obj, callbacks) {
			obj.listenTo(this, 'change:current_trade_ratio', callbacks);
		},

		onSatisfactionUpdate : function(obj, callbacks) {
			obj.listenTo(this, 'change:satisfaction', callbacks);
		},

		/**
		 * @return {FarmTownPlayerRelation || null} the one that updates next or null
		 * useful to set a timer for a notification refetch
		 */
		getNextFarmUpgradedFarmTown: function() {
			var sorted = this.sortBy('expansion_at');
			var filtered = us.filter(sorted, function(model) {
				return model.getExpansionAt() !== null;
			});
			return us.first(filtered);
		},

		/**
		 * apply a trade_office bonus to all models and set the current_trade_ratio
		 * @param {Number} trade_ratio_bonus expected to be either 0 or 0.x
		 */
		applyTradeRatioBonus: function(trade_office_bonus, options) {
			this.each(function(model) {
				model.applyTradeRatioBonus(trade_office_bonus, options);
			});
		},

		/**
		 * recalculate the trade ratio for all farm town periodically - called from global timer
		 * @see model
		 * @see listeners/farm_town_trade_ratio
		 * @see BE GameFarmTownPlayerRelation.php->calculateCurrentTradeRatioFor
		 */
		updateTradeRatioTimeDiff: function() {
			this.each(function(model) {
				model.updateTradeRatioTimeDiff();
			});
		}
	};


	window.GameCollections.FarmTownPlayerRelations = GrepolisCollection.extend(FarmTownPlayerRelations);

	return window.GameCollections.FarmTownPlayerRelations;
});
