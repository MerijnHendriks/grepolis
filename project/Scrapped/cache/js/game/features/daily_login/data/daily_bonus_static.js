define('features/daily_login/data/daily_bonus_static', function() {
	'use strict';

	var GameData = require('game/data');

	return {
		getDaysTotal : function() {
			return GameData.dailyBonusStatic.num_levels;
		},

		getLoginInARowHighest : function() {
			return GameData.dailyBonusStatic.login_in_a_row_highest;
		},

		getRewardsList : function() {
			return GameData.dailyBonusStatic.rewards_list;
		},

		getGobletContentForDay : function(day) {
			return GameData.dailyBonusStatic.mystic_rewards[day];
		}
	};
});
