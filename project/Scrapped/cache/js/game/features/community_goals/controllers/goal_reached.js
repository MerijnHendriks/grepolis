define('features/community_goals/controllers/goal_reached', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var GoalReachedView = require('features/community_goals/views/goal_reached');

	var GoalReachedController = GameControllers.TabController.extend({

		initialize : function(options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
            this.rewards = this.getArgument('rewards');
		},

		renderPage : function() {
			this.view = new GoalReachedView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getRewardsCss : function() {
			var reward_css = this.rewards.map(function(reward) {
				return 'power_icon60x60 ' + reward.power_id + ' ' + this.getArgument('window_skin');
			}.bind(this));

			return reward_css;
		},

		getRewards: function() {
			return this.rewards;
		},

		destroy : function() {

		}
	});

	return GoalReachedController;
});
