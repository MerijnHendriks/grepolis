/* globals GameViews, GameDataPowers */

define('events/crafting/controllers/sub_windows/overall_rewards', function(require) {
	'use strict';

	var BaseController = window.GameControllers.BaseController;

	var SubWindowEasterOverallRewardsController = BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowEasterOverallRewardsView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getOverallRankingRewards : function() {
			return this.getModel('easter').getOverallRankingRewards();
		},

		getRankingAward : function(position) {
			return this.getModel('easter').getOverallRankingAward() + '_' + (5 - position);
		},

		getRankingRewards : function() {
			var rewards = this.getOverallRankingRewards();
			var prepared = [];

			for (var i = 0; i < rewards.length; i++) {
				var daily_rewards = rewards[i];
				var prizes = [];

				for(var j = 0; j < daily_rewards.length; j++) {
					var daily_reward = daily_rewards[j];

					prizes.push({
						amount : daily_reward.amount,
						css_class : GameDataPowers.getRewardCssClassIdWithLevel(daily_reward.reward)
					});
				}

				prepared.push(prizes);
			}

			return prepared;
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowEasterOverallRewardsController = SubWindowEasterOverallRewardsController;
	return SubWindowEasterOverallRewardsController;
});
