/* globals GameModels, GrepolisModel */

(function() {
	'use strict';

	var AdventSpot = function () {}; // never use this, because it will be overwritten
	AdventSpot.urlRoot = 'AdventSpot';

	GrepolisModel.addAttributeReader(AdventSpot,
		'state',
		'number',
		'spot_rewards',
		'price_for_spin',
		'start',
		'duration',
		'end',
		'is_last',
		'has_spun',
		'free_refill_already_used'
	);

	/**
	 * check if the current spin is for free
	 *
	 * @returns {Boolean}
	 */
	AdventSpot.isFreeSpin = function() {
		return this.getPriceForSpin() === 0;
	};

	/**
	 * test how many already collected slots are between start and start+step
	 *
	 * @param {Integer} start reward pos to start counting
		 * @param {Integer} step number of slots from start to check
		 * @returns {Integer}
	 */
	AdventSpot.numberCollectedRewardsInRange = function(start, step) {
		var i,
			collected_count = 0,
			end = start + step;

		for (i = start; i <= end; i++) {
			var real_position = i % 6;
			if (this.isRewardCollected(real_position)) {
				collected_count++;
			}
		}

		return collected_count;
	};

	/**
	 * test if reward on that position was collected
	 *
	 * @param {Integer} position
	 * @returns {Boolean}
	 */
	AdventSpot.isRewardCollected = function(position) {
		var rewards = this.getSpotRewards();
		return rewards[position].collected;
	};

	/**
	 * true, if reward is collectable
	 *
	 * @param {Integer} position
	 * @returns {Boolean}
	 */
	AdventSpot.isRewardCollectable = function(position) {
		var rewards = this.getSpotRewards();
		return rewards[position].collectable;
	};

	/**
	 * true, if reward has already been spun
	 *
	 * @param {Integer} position
	 * @returns {Boolean}
	 */
	AdventSpot.isRewardSpun = function(position) {
		var rewards = this.getSpotRewards();
		return rewards[position].refill_count > 0;  // TODO someone who knows what they are doing please confirm
	};

	/**
	 * true, if any reward is spun
	 */
	AdventSpot.isAnyRewardSpun = function() {
		return this.getHasSpun();
	};

	/**
	 * Return number of not collected rewards
	 *
	 * @returns {Number}
	 */
	AdventSpot.getNotCollectedRewardsCount = function() {
		var rewards = this.getSpotRewards(), i, l = rewards.length,
			count = 0;

		for (i = 0; i < l; i++) {
			if (!rewards[i].collected) {
				count++;
			}
		}

		return count;
	};

	/**
	 * Return number of collected rewards
	 *
	 * @returns {Number}
	 */
	AdventSpot.getCollectedRewardsCount = function() {
		var rewards = this.getSpotRewards(), i, l = rewards.length,
			count = 0;

		for (i = 0; i < l; i++) {
			if (rewards[i].collected) {
				count++;
			}
		}

		return count;
	};

	/**
	 * get the current reward that is created but not collected
	 *
	 * @returns {Object} or undefined
	 */
	AdventSpot.getRewardToTake = function() {
		var rewards = this.getSpotRewards(),
			reward = us.find(rewards, function(reward) {
				return reward.collectable && !reward.collected;
			});

		return reward;
	};

	/**
	 * Get the current reward itemmodel that is created but not collected
	 *
	 * @return {GameModels.RewardItem}
	 */
	AdventSpot.getRewardToTakeModel = function() {
		var reward_raw_data = this.getRewardToTake(),
			reward_item;

		if (reward_raw_data) {
			reward_item = new GameModels.RewardItem(reward_raw_data);
		}

		return reward_item;
	};

	/**
	 * execute spin on the spot
	 *
	 * @param {Function} callback
	 * @returns {void}
	 */
	AdventSpot.spin = function(callback) {
		this.execute('spin', {
			spot_number: this.getNumber(),
			estimated_costs: this.getPriceForSpin()
		}, callback);
	};

	/**
	 * execute refill on the spot
	 *
	 * @param {Number} estimated_costs
	 * @param {Function} callback
	 * @returns {void}
	 */
	AdventSpot.refill = function(estimated_costs, callback) {
		this.execute('refill', {
			spot_number: this.getNumber(),
			estimated_costs: estimated_costs
		}, callback);
	};

	window.GameModels.AdventSpot = GrepolisModel.extend(AdventSpot);
}());
