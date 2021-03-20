/* global GameViews, GameData  */
(function() {
	'use strict';

	var BaseController = window.GameControllers.BaseController;

	var SubWindowCampaignDailyRewardsController = BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			BaseController.prototype.initialize.apply(this, arguments);

			this.event_model = this.getModel('campaign');
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowCampaignDailyRewardsView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getDailyRankingAward : function() {
			return this.event_model.getDailyRankingAward();
		},

		getDailyRankingReward : function() {
			return this.event_model.getDailyRankingReward();
		},

		getRewardName : function() {
			var daily_reward = this.getDailyRankingReward();
			var reward_id = daily_reward.reward.power_id;

			return GameData.powers[reward_id].name;
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowCampaignDailyRewardsController = SubWindowCampaignDailyRewardsController;
}());
