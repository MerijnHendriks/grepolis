/* globals GameViews, GameData */

define('events/crafting/controllers/sub_windows/daily_rewards', function(require) {
	'use strict';

	var BaseController = window.GameControllers.BaseController;

	var SubWindowEasterDailyRewardsController = BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowEasterDailyRewardsView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getDailyRankingAward : function() {
			return this.getModel('easter').getDailyRankingAward();
		},

		getDailyRankingReward : function() {
			return this.getModel('easter').getDailyRankingReward();
		},

		getRewardName : function() {
			var daily_reward = this.getDailyRankingReward();
			var reward_id = daily_reward.reward.power_id;

			return GameData.powers[reward_id].name;
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowEasterDailyRewardsController = SubWindowEasterDailyRewardsController;
	return SubWindowEasterDailyRewardsController;
});
