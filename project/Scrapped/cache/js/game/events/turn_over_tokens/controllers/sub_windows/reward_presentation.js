define('events/turn_over_tokens/controllers/sub_windows/reward_presentation', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowEnemyDownView = require('events/turn_over_tokens/views/sub_windows/reward_presentation');

	var SubWindowEnemyDownController = GameControllers.SubWindowController.extend({

		initialize : function(options) {
			//Intentionally skip the SubWindowController initialize, because it forces a view upon us
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.window_controller = options.window_controller;
			this.rewards = options.rewards;
			this.window_type = options.window_type;
			this.unit = options.unit || '';
			this.resolvePromise = options.resolvePromise;
			this.setOnBeforeClose(function() {
				this.resolvePromise(this.rewards);
			}.bind(this));
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowEnemyDownView({
				el : this.$el,
				controller : this
			});
			return this;
		},

		getWindowType : function() {
			return this.window_type;
		},

		getWindowCss : function() {
			return this.getWindowType() + ' ' + this.unit;
		},

		getRewardsCss : function() {
			var reward_css = this.rewards.map(function(reward) {
				if (reward.power_id) {
					return 'power_icon60x60 ' + reward.power_id;
				} else if (reward.special_reward && reward.special_reward.trophy) {
					return 'trophy ' + reward.special_reward.trophy;
				} else if (reward.special_reward && reward.special_reward.arrows) {
					return 'arrows ' + reward.special_reward.arrows;
				}
				return '';
			});
			return reward_css;
		},

		getRewards: function() {
			return this.rewards;
		},

		closeMe : function() {
			this.window_controller.closeSubWindow();
			this.resolvePromise(this.rewards);
		},

		destroy : function() {

		}
	});

	return SubWindowEnemyDownController;
});
