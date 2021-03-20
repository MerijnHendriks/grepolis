define('events/spawn/controllers/sub_window_reward', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowRewardView = require('events/spawn/views/sub_window_reward');

	var SubWindowRewardController = GameControllers.SubWindowController.extend({

		initialize : function(options) {
			//Intentionally skip the SubWindowController initialize, because it forces a view upon us
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowRewardView({
				el : this.$el,
				controller : this
			});
			return this;
		},

		getRewards: function() {
			var mission = this.getMission();
			return {
				favor: mission.getFavor(),
				all_resources: mission.getResourcesAmount(),
				stone: mission.gotStone() ? 1 : 0
			};
		},

		/**
		 * @return {SpawnMission}
		 */
		getMission: function() {
			return this.getModel('mission');
		},

		onClaimClicked: function() {
			var closeSubWindow = this.window_controller.closeSubWindow.bind(this.window_controller),
				got_stone = this.getMission().gotStone(),
				animateStone = function() {
					if (got_stone) {
						return this.window_controller.view.animateStone();
					}
				}.bind(this);

			this.window_controller
			.claimReward()
			.then(animateStone)
			.then(closeSubWindow)
			.catch(function(error) {
				// if we can't claim (e.g. no god in town) suppress error (we have HumanErrorMessage), but close the subwindow
				// (this catch is also called when the user chooses "no" in the waste resource dialog)
				closeSubWindow();
			});
		},

		destroy : function() {

		}
	});

	return SubWindowRewardController;
});
