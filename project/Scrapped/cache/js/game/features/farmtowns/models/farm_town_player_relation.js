/*global define, Timestamp */

define('farmtowns/models/farm_town_player_relation', function() {
	'use strict';

	var LOCK_STATUS_CHANGED_EVENT = 'lock_status_changed';
	var TRADE_RATIO_PER_HOUR = 0.02;

    var GrepolisModel = require_legacy('GrepolisModel');
    var GameEvents = require('data/events');
	var GameDataFarmTowns = require('data/farm_town');
	var Game = window.Game;
    var triggerMapTownsRefreshEvent = function() {
        $.Observer(GameEvents.map.refresh.towns).publish({});
    };

	var FarmTownPlayerRelation = GrepolisModel.extend({
		urlRoot : 'FarmTownPlayerRelation',
		initialize : function() {
			this.onLevelChange(this, function(new_model) {
				var previous = new_model.previousAttributes();
				if (previous.expansion_stage === 0) {
					this.trigger(LOCK_STATUS_CHANGED_EVENT, new_model.isLocked());
				}
			}, this);

			this.set('current_trade_ratio', GameDataFarmTowns.getTradeRatioDefault());

			this.setRatioTimeDiff(0);
			this.on('ratio_updated_at:change', function() {
				this.setRatioTimeDiff(0);
			});
		},

		getLevel : function() {
			// when the relation status is set to 0 set the level to 0
			return this.getRelationStatus() === 0 ? 0 : this.getExpansionStage();
		},

		isLocked : function() {
			return this.getLevel() === 0;
		},

		isLootable : function() {
			return Timestamp.now() >= this.getLootableAt();
		},

		isUpgradeRunning : function() {
			return this.getExpansionAt() > 0;
		},

		claim : function(type, option, callbacks) {
			var promise = this.execute('claim', {
				farm_town_id: this.getFarmTownId(),
				type: type,
				option: option
			}, callbacks);

			if (promise) {
				promise.then(function() {
					triggerMapTownsRefreshEvent();
				});
			}
		},

		trade : function(amount, callbacks) {
			var promise = this.execute('trade', {
				farm_town_id: this.getFarmTownId(),
				amount: amount
			}, callbacks);

			if (promise) {
				promise.then(function() {
					triggerMapTownsRefreshEvent();
				});
			}
		},

		upgrade : function(callbacks) {
			var promise = this.execute('upgrade', {
				farm_town_id: this.getFarmTownId()
			}, callbacks);

			if (promise) {
				promise.then(function() {
					triggerMapTownsRefreshEvent();
				});
			}
		},

		unlock : function(callbacks) {
			var promise = this.execute('unlock', {
				farm_town_id: this.getFarmTownId()
			}, callbacks);

			if (promise) {
				promise.then(function() {
					triggerMapTownsRefreshEvent();
				});
			}
		},

		getClaimResourceValues : function() {
			var claim_resource_values = this.get('claim_resource_values');
			if (!claim_resource_values || !claim_resource_values.length) {
				return {
					0: 0,
					1: 0,
					2: 0,
					3: 0,
					4: 0
				};
			}
			return claim_resource_values;
		},

		getMaxCapacity : function() {
			return this.get('max_trade_capacity');
		},

		/**
		 * current_trade_ratio reflects the trade_ratio + trade office bonus + the hourly change of trade ratio
		 */
		getCurrentTradeRatio : function() {
			return this.get('current_trade_ratio');
		},

		setCurrentTradeRatio : function(ratio, options) {
			this.set('current_trade_ratio', ratio, options);
		},

		/**
		 * set and get the ratio_time_diff, the change of ratio since it was last updated from the server
		 * Explaination: the trade ratio grows per 0.02 per hour
		 */
		getRatioTimeDiff : function() {
			return this.get('ratio_time_diff');
		},

		setRatioTimeDiff : function(ratio_time_diff) {
			this.set('ratio_time_diff', ratio_time_diff);
		},
		
		getHymnToAphroditeTradeBonus: function () {
			return this.get('hymn_to_aphrodite_trade_bonus');
		},

		/**
		 * recalculate the trade ratio for all farm town based on the formular
		 *  round(time_difference_since_last_update / 3600) * 0.02 * game_speed
		 *
		 * meaning: the ratio increases by 0.02 * game_speed / hour
		 * @see listeners/farm_town_trade_ratio
		 * @see BE GameFarmTownPlayerRelation.php->calculateCurrentTradeRatioFor
		 */
		updateTradeRatioTimeDiff : function() {
			var ratio_time_diff = Math.round((Timestamp.now() - this.getRatioUpdatedAt()) / 3600 * TRADE_RATIO_PER_HOUR * Game.game_speed * 100) / 100;

			if (ratio_time_diff > 0 && this.getTradeRatio() + ratio_time_diff < GameDataFarmTowns.getTradeRatioDefault()) {
				this.setRatioTimeDiff(ratio_time_diff);
			}
		},

		/**
		 * apply a given trade office bonus (or 0) to the 'current_trade_ratio'
		 */
		applyTradeRatioBonus : function(trade_office_bonus, options) {
			var trade_ratio = this.getTradeRatio(),
				ratio_time_diff = this.getRatioTimeDiff(),
				current_trade_ratio = Math.round((trade_ratio + ratio_time_diff + trade_office_bonus) * 100) / 100;

			this.setCurrentTradeRatio(current_trade_ratio, options);
		},

		onClaimResourceValuesChanged : function(obj, callback, context) {
			obj.listenTo(this, 'change:claim_resource_values', callback.bind(context));
		},

		onLockStatusChanged : function(obj, callback, context) {
			obj.listenTo(this, 'change:lock_status_changed', callback.bind(context));
		},

		onLevelChange : function(obj, callback, context) {
			obj.listenTo(this, 'change:expansion_stage', callback.bind(context));
		},

		onExpansionAtChange : function(obj, callback, context) {
			obj.listenTo(this, 'change:expansion_at', callback.bind(context));
		},

		refetchTownSpecificData : function() {
			this.execute('getTownSpecificData', {
				farm_town_id: this.getFarmTownId()
			}, function(data) {
				this.set(data, {silent : true});
				this.trigger('town_specific_data');
			}.bind(this));
		},

		onTradeDurationChange : function(obj, callbacks) {
			obj.listenTo(this, 'change:trade_duration', callbacks);
		},

		onCurrentTradeRatioChange : function(obj, callbacks) {
			obj.listenTo(this, 'change:current_trade_ratio', callbacks);
		},

		onTownSpecificDataChange : function(obj, callback) {
			obj.listenTo(this, 'town_specific_data', callback);
		},

		onFarmTownLastLootedAtChange : function(obj, callback) {
			obj.listenTo(this, 'change:last_looted_at', callback);
		},

		onFarmTownRelationStatusChange : function(obj, callback) {
			obj.listenTo(this, 'change:relation_status', callback);
		}
	});

	GrepolisModel.addAttributeReader(FarmTownPlayerRelation.prototype,
		'id',
		'name',
		'player_id',
		'satisfaction',
		'updated_at',
		'trade_ratio',		// trade_ratio !trade_office not included, use current_trade_ratio
		'ratio_updated_at',
		'lootable_at',
		'last_looted_at',
		//@TODO create a relation_status ENUM and helper function (isPlayerOwned, isRevoltRunning)
		'relation_status', //0 - does not belong to the player, 1 - belongs to the player, 2 - revolt running
		'has_wall',
		'loot',
		'farm_town_id',
		'trade_duration',
		'expansion_stage',	// BPV only
		'expansion_at'		// BPV only
	);

	GrepolisModel.addTimestampTimer(FarmTownPlayerRelation, 'expansion_at', true);

	window.GameModels.FarmTownPlayerRelation = FarmTownPlayerRelation;

	return FarmTownPlayerRelation;
});
