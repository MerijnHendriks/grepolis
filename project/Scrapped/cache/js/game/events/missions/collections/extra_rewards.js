/*global window*/

define('events/missions/collections/extra_rewards', function (require) {
	'use strict';

	var GrepolisCollection = require_legacy('GrepolisCollection');
	var MissionsExtraReward = require('events/missions/models/extra_reward');

	var MissionsExtraRewards = GrepolisCollection.extend({
		model: MissionsExtraReward,
		model_class: 'MissionsExtraReward',
		comparator: 'level',

		getRewardForLevel : function(level) {
			var reward = this.findWhere({level : level});

			if (!reward) {
				return null;
			}

			return reward.getRewardData();
		}
	});

	window.GameCollections.MissionsExtraRewards = MissionsExtraRewards;

	return MissionsExtraRewards;
});