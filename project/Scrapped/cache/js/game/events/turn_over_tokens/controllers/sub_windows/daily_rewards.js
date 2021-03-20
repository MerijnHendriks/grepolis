/* global GameViews, GameData  */
(function() {
	'use strict';

	var BaseController = window.GameControllers.BaseController;

	var SubWindowAssassinsDailyRewardsController = BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			BaseController.prototype.initialize.apply(this, arguments);

			this.ranking_model = this.getModel('assassins_ranking');
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowAssassinsDailyRewardsView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getDailyRankingAward : function() {
			return this.ranking_model.getDailyRankingAward();
		},

		getDailyRankingReward : function() {
			return this.ranking_model.getDailyRankingReward();
		},

		getRewardName : function() {
			var daily_reward = this.getDailyRankingReward();
			var reward_id = daily_reward.reward.power_id;

			return GameData.powers[reward_id].name;
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowAssassinsDailyRewardsController = SubWindowAssassinsDailyRewardsController;
}());
