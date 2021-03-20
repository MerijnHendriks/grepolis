/*global TooltipFactory */

define('features/community_goals/views/goal_reached', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var GoalReachedView = View.extend({

		initialize: function (options) {
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
			this.initializeOkayButton();
		},

		render : function() {
			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n,
				rewards: this.controller.getRewardsCss()
			});
			this.bindRewardTooltip();
		},

		bindRewardTooltip : function() {
			var rewards = this.controller.getRewards(),
				$el = this.$el.find('.reward');

			rewards.forEach(function(reward) {
				var tooltip = '';

				if (reward.power_id) {
					tooltip = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);
				}
				$el.tooltip(tooltip);
			});
		},

		initializeOkayButton: function() {
			this.unregisterComponent('btn_okay');
			this.registerComponent('btn_okay', this.$el.find('.btn_okay').button({
				template : 'tpl_simplebutton_borders',
				caption : this.l10n.okay_button
			}).on('btn:click', this.controller.closeWindow.bind(this.controller)));
		},

		destroy : function() {
		}
	});

	return GoalReachedView;
});
