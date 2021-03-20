(function() {
	'use strict';

	var GameData = window.GameData;
	var us = window.us;

	var GameDataHercules2014 = {
		/**
		 * get all units
		 *
		 * @returns {Array}
		 */
		getAllUnits : function() {
			return us.values(GameData.campaignUnits);
		},

		/**
		 * return the sorting order no for a unit
		 * @return {Number}
		 */
		getUnitSortingOrderNo : function(unit_type) {
			for (var unit_order_no in GameData.campaignUnits) {
				if (GameData.campaignUnits.hasOwnProperty(unit_order_no)) {
					var unit = GameData.campaignUnits[unit_order_no];

					if (unit.type === unit_type) {
						return unit_order_no;
					}
				}
			}
		},
		/**
		 * Get all unit
		 *
		 * @return {Array}
		 */
		getAllUnitTypes : function() {
			var units = [], all_units = this.getAllUnits() ;

			for (var i = 0, l = all_units.length; i < l; i++) {
				units.push(all_units[i].type);
			}

			return units;
		},

		/**
		 * get single unit
		 *
		 * @returns {Array}
		 */
		getUnit : function(unit_type) {
			var unit, all_units = this.getAllUnits();

			for (var i = 0, l = all_units.length; i < l; i++) {
				unit = all_units[i];

				if (unit.type === unit_type) {
					return unit;
				}
			}
		},

		/**
		 * return the unit name for a given type
		 *
		 * @param {String} unit_type
		 * @returns {String}
		 */
		getUnitName : function(unit_type) {
			return GameDataHercules2014.getUnit(unit_type).name;
		},

		/**
		 * return base cost for a given unit type
		 *
		 * @param {String} unit_type
		 * @return {Number}
		 */
		getBaseCostFor : function(unit_type) {
			return GameDataHercules2014.getUnit(unit_type).base_costs;
		},

		/**
		 * get all stages as an array
		 *
		 * @returns {Array}
		 */
		getAllStages : function() {
			return us.values(GameData.campaignStages);
		},

		/**
		 * returns all static data for a stage
		 *
		 * @returns {Object}
		 */
		getStage : function(stage_id) {
			return GameData.campaignStages[stage_id];
		},

		/**
		 * return stage reward for given stage
		 *
		 * @param {Number} stage_id
		 * @return {Object} reward
		 */
		getStageReward : function(stage_id) {
			return GameDataHercules2014.getStage(stage_id).reward;
		},

		/**
		 * return max duration for healer cooldown, as defined by GD
		 * @return {Number}
		 */
		getHealerCooldownDuration: function() {
			return this.getCampaignMeta().healer_cooldown;
		},

		/**
		 * return max duration for hercules cooldown, as defined by GD
		 * @return {Number}
		 */
		getHerculesCooldownDuration: function() {
			return this.getCampaignMeta().hero_cooldown;
		},

		/**
		 * return max duration for hercules cooldown, as defined by GD
		 * @return {Number}
		 */
		getStageCooldownDuration: function() {
			return this.getCampaignMeta().stage_cooldown;
		},

		/**
		 * return base cost for healer
		 * @return {Number}
		 */
		getHealerBaseCost: function() {
			return this.getCampaignMeta().healer_base_cost;
		},

		/**
		 * return hercules instant heal cost
		 * @return {Number}
		 */
		getHeroBaseHealCost : function() {
			return this.getCampaignMeta().hercules_base_cost;
		},

		/**
		 * return max amount of units you can get per day
		 * @return {Number}
		 */
		getMaxAmountofDropUnits : function() {
			return 10;
		},

		/**
		 * return array with all previous stage_ids for a given stage_id
		 * @param {Number} stage_id
		 * @return {Array} array with previous stage ids
		 */
		getPreviousStageIds : function(stage_id) {
			var prev_stage_ids = GameDataHercules2014.getStage(stage_id).previous_stage_ids;
			return us.values(prev_stage_ids);
		},

		/**
		 * return base bonus factor for first campain bonus
		 * @return {Number} bonus_factor
		 */
		getFirstBonusFactor : function() {
			return this.getCampaignMeta().primary_bonus;
		},

		/**
		 * return base bonus factor for second campain bonus
		 * @return {Number} bonus_factor
		 */
		getSecondBonusFactor : function() {
			return this.getCampaignMeta().secondary_bonus;
		},

		getCampaignMeta: function() {
			return GameData.campaignMeta;
		},

		/**
		 * return the maximum amount of units one can send into a stage
		 *
		 * @param {Number} stage_id
		 * @return {Number}
		 */
		getStageMaxUnits : function(stage_id) {
			return GameDataHercules2014.getStage(stage_id).unit_capacity;
		},

		/**
		 * return ID of the rewarded hero
		 */
		getRewardHeroId : function() {
			return GameDataHercules2014.getStage(33).onetime_rewards[1].subtype;
		}
	};

	window.GameDataHercules2014 = GameDataHercules2014;
}());
