/* global GameDataPowers, GameViews */
(function() {
	'use strict';

	var BaseController = window.GameControllers.BaseController;

	var SubWindowCampaignOverallRewardsController = BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			BaseController.prototype.initialize.apply(this, arguments);
			this.event_model = this.getModel('campaign');
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowCampaignOverallRewardsView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getOverallRankingRewards : function() {
			return this.event_model.getOverallRankingRewards();
		},

		/**
		 * if a position is given, it returns the correct award leve id,
		 * otherwise the generic id
		 * @param {number} position
		 * @returns {string}
		 */
		getRankingAward : function(position) {
			if (position) {
				return this.event_model.getOverallRankingAward() + '_' + (5 - position);
			}
			return this.event_model.getOverallRankingAward();
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

	window.GameControllers.SubWindowCampaignOverallRewardsController = SubWindowCampaignOverallRewardsController;
}());
