/*global GrepolisModel ,GameData, GameDataPowers */

define('events/crafting/models/easter', function(require) {
	'use strict';

	var Easter = function () {}; // never use this, because it will be overwritten
	Easter.urlRoot = 'Easter';

	Easter.getDailyRankingAward = function() {
		return this.get('ranking_awards').daily;
	};

	Easter.getOverallRankingAward = function() {
		return this.get('ranking_awards').overall;
	};

	Easter.getDailyRankingReward = function() {
		return this.get('ranking_rewards').daily;
	};

	Easter.getOverallRankingRewards = function() {
		return this.get('ranking_rewards').overall;
	};

	Easter.getEventEndAt = function() {
		return this.get('event_end_at');
	};

	Easter.getProgressRewards = function() {
		return this.get('progress_rewards');
	};

	Easter.isRankingEnabled = function() {
		return this.get('ranking_enabled') === true;
	};

	Easter.getNextMidnight = function() {
		return this.get('next_midnight');
	};

	/**
	 * @returns {Object} reward: string, threshold: Number
	 */
	Easter.getFirstProgressReward = function() {
		return this.getProgressRewards()[0];
	};

	/**
	 * @returns {Object} reward: string, threshold: Number
	 */
	Easter.getSecondProgressReward = function() {
		return this.getProgressRewards()[1];
	};

	Easter.getRewardId = function(reward_type, reward_subtype) {
		var reward_id = '';
		if (reward_type === 'instant_resources') {
			reward_id = 'instant_resources_' + reward_subtype;
		} else if (reward_type === 'longterm_resource_boost') {
			reward_id = 'longterm_' + reward_subtype + '_boost';
		} else if (reward_type === 'resource_boost') {
			reward_id = 'resource_' + reward_subtype;
		} else if (reward_type === 'instant_currency') {
			reward_id = reward_subtype + '_generation';
		} else if (reward_type === 'unit_training_boost') {
			reward_id = reward_subtype + '_generation';
		} else if (reward_type === 'population_boost') {
			reward_id = reward_subtype + '_' + reward_type;
		} else if (reward_subtype === 'default') {
			reward_id = reward_type;
		}

		return reward_id;
	};

	Easter.getAllRewards = function() {
		var all_rewards = this.get('all_rewards'), rewards = {}, reward_type, reward_subtype, reward_id, gd_powers = GameData.powers, configuration;

		for (reward_type in all_rewards) {
			if (all_rewards.hasOwnProperty(reward_type)) {
				for (reward_subtype in all_rewards[reward_type]) {
					if (all_rewards[reward_type].hasOwnProperty(reward_subtype)) {

						reward_id = this.getRewardId(reward_type, reward_subtype);
						configuration = all_rewards[reward_type][reward_subtype].configuration || {};

						rewards[reward_id] = {
							recipe_count : all_rewards[reward_type][reward_subtype].recipe_count,
							reward_type : reward_type,
							reward_name : (gd_powers.hasOwnProperty(reward_type) ? GameDataPowers.getPowerName({power_id: reward_type, configuration: configuration}) : 'no name found'),
							reward_subtype : reward_subtype,
							configuration : configuration
						};
					}
				}
			}
		}

		return rewards;
	};

	Easter.getGuest = function() {
		return this.get('guest');
	};

	Easter.craft = function(types, callbacks) {
		return this.execute('craft', {ingredient_types: types}, callbacks);
	};

	Easter.onGuestChange = function(obj, callback) {
		obj.listenTo(this, 'change:guest', callback);
	};

	//Tanking enabled is "true" during entire event, its false only when the event finishes, the tanking is closed, but users can still brew
	Easter.onRankingAccessibilityChange = function(obj, callback) {
		obj.listenTo(this, 'change:ranking_enabled', callback);
	};

	window.GameModels.Easter = GrepolisModel.extend(Easter);
	return Easter;
});
