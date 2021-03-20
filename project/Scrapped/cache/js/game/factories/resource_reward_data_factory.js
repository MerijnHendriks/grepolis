/* global us, Game, GeneralModifications, GameDataPowers */
/**
 * The purpose of extract resource amounts from different data sources into a simple { <name>: <amount> }
 *
 * The usecase are resource Data we have in the game represented in different ways:
 *  1. Daily Login Gift
 *  2. Tutorial Quest
 *  3. Rewards instant_favor and instant_resource
 *  4. casted powers
 *
 */

define('factories/resource_reward_data_factory', function(require) {

	var RES = { wood: 'wood', iron: 'iron', stone: 'stone', favor: 'favor', all: 'all' };
	/**
	 * given a object of the form { power_id : '', configuration: { type: '', amount: ''}}
	 */
	var convert_from_rewardish_type = function(reward_data) {
		var simple_data = {};

		// resource relevant powers are listed above
		if (GameDataPowers.isWasteable(reward_data.power_id) === false) {
			return {};
		}

		// special case: favor
		if (reward_data.power_id === 'instant_favor' || reward_data.power_id === 'instant_favor_package') {
			reward_data.configuration.type = 'favor';
		}

		var amount = reward_data.configuration.amount;
        if (reward_data.power_id === 'wedding') {
        	amount += GeneralModifications.getWeddingAdditionalResources();
        }

		// special case: resource 'all'
		if (reward_data.configuration.type === 'all') {
			simple_data[RES.wood] = amount;
			simple_data[RES.stone] = amount;
			simple_data[RES.iron] = amount;
		} else {
			// normal case
			simple_data[reward_data.configuration.type] = amount;
		}

		return simple_data;
	};

	var ResourceRewardDataFactory = {
		/**
		 * no migration needed, factor a clone
		 */
		fromDailyLoginGift : function(daily_login_data) {
			return us.clone(daily_login_data);
		},

		/**
		 * the last level of a daily login gift has a totally different format - hey, why not. Its wired.
		 */
		fromLastLevelDailyLoginGift : function(gift_data) {
			var simple_data = {};

			if (gift_data.type === RES.favor) {
				simple_data[RES.favor] = gift_data.value;
			} else {
				simple_data[RES.stone] = gift_data.value;
				simple_data[RES.wood] = gift_data.value;
				simple_data[RES.iron] = gift_data.value;
			}
			return simple_data;
		},
		/**
		 * tutorial reward store the plain data in the 'data' property, return a clone to allow discarding the original data
		 */
		fromTutorialReward : function(tutorial_reward) {
			if (!tutorial_reward.data) {
				return {};
			}
			return us.clone(tutorial_reward.data);
		},

		fromInventoryItemModel : function(inventory_item_model) {
			var reward_data = inventory_item_model.getProperties();

			return convert_from_rewardish_type(reward_data);
		},

		/**
		 * spells have the inventory model hidden in the casted powers model
		 */
		fromCastedPowersModel : function(casted_powers_model) {
			return convert_from_rewardish_type({
				power_id: casted_powers_model.getPowerId(),
				configuration: casted_powers_model.getConfiguration()
			});
		},

		/**
		 * farm town always loot / demand all 3 main resources with the same amount
		 */
		fromFarmTownClaim : function(amount_for_all) {
			var simple_data = {};

			simple_data[RES.wood] = amount_for_all;
			simple_data[RES.stone] = amount_for_all;
			simple_data[RES.iron] = amount_for_all;

			return simple_data;
		},

		fromRewardPowerData : function(reward_power_data) {
			return convert_from_rewardish_type(reward_power_data);
		},

		fromRewardItemModel : function(reward_item_model) {
			if (Game.dev) {
				throw 'not implemented';
			}
		}
	};

	return ResourceRewardDataFactory;

});
