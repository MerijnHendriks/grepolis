(function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var GameModels = window.GameModels;

	var ModelClass = function () {}; // never use this, because it will be overwritten
	ModelClass.urlRoot = 'CampaignPlayerStage';

	GrepolisModel.addAttributeReader(ModelClass,
		'onetime_rewards',
		'fight_result',
		'reward',
		'current_level',
		'stage_id'
	);

	ModelClass.getEnemyArmy = function() {
		return this.get('units');
	};

	ModelClass.getEnemyUnitAmount = function(mercenary_type) {
		var army = this.getEnemyArmy();
		if (!army[mercenary_type]) {
			return { amount_total: 0, amount_healthy: 0, amount_damaged: 0 };
		}
		return army[mercenary_type];
	};

	ModelClass.getLuckValue = function() {
		var luck_value = this.getFightResult().luck_value;
		if (!luck_value) {
			return 0;
		}
		return Math.round((luck_value - 1) * 100);
	};

	ModelClass.getHeroValue = function() {
		var hero_value = this.getFightResult().hero_value;
		if (!hero_value) {
			return 0;
		}
		return Math.round((hero_value - 1) * 100);
	};

	ModelClass.hasReward = function() {
		return this.get('has_reward');
	};

	ModelClass.hasOnetimeRewards = function() {
		return !!(this.get('onetime_rewards').length);
	};

	ModelClass.getId = function() {
		return this.get('stage_id');
	};

	ModelClass.getCooldown = function() {
		return this.get('cooldown_timestamp');
	};

	ModelClass.hasCooldown = function() {
		return !!(this.get('cooldown_timestamp'));
	};

	ModelClass.attack = function(attacking_units, callbacks) {
		this.execute('fight', attacking_units, callbacks);
	};

	/**
	 * true, if the LAST fight on this stage has been won
	 */
	ModelClass.isStageWon = function() {
		var fight_result = this.get('fight_result');

		if (fight_result && fight_result.has_attacker_won) {
			return true;
		}
		return false;
	};

	/**
	 * true, if the player as won a stage and reached the 'next' stage level (2)
	 */
	ModelClass.isWonMoreThanOnce = function() {
		return (this.getCurrentLevel() > 1);
	};

	/**
	 * true if the stage has only reward data and nothing else
	 */
	ModelClass.hasOnlyRewardData = function() {
		return !(this.hasCooldown() || this.getFightResult());
	};

	ModelClass.onCooldownChange = function(obj, callback) {
		obj.listenTo(this, 'change:cooldown_timestamp', callback);
	};

	ModelClass._getRewardObject = function(stage_id) {
		var reward_data = this.getReward(),
			reward = new GameModels.RewardItem({
				id : stage_id,
				level : reward_data.level,
				type : reward_data.type,
				subtype : reward_data.subtype,
				power_id : reward_data.power_id,
				configuration : reward_data.configuration
			});
		return reward;
	};

	ModelClass.useReward = function(stage_id, callbacks) {
		var reward = this._getRewardObject(stage_id);

		if (reward !== null) {
			reward.use(callbacks, 'hercules2014');
		}
	};

	ModelClass.stashReward = function(stage_id, callbacks) {
		var reward = this._getRewardObject(stage_id);

		if (reward !== null) {
			reward.stash(callbacks, 'hercules2014');
		}
	};

	ModelClass.trashReward = function(stage_id, callbacks) {
		var reward = this._getRewardObject(stage_id);

		if (reward !== null) {
			reward.trash(callbacks, 'hercules2014');
		}
	};

	window.GameModels.CampaignPlayerStage = GrepolisModel.extend(ModelClass);
}());
