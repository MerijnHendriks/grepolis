/*global TooltipFactory */

define('events/turn_over_tokens/views/sub_windows/reward_presentation', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowEnemyDownView = View.extend({

		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
			this.initializeOkayButton();
		},

		render : function() {
			this.renderTemplate(this.$el, 'sub_window_reward_presentation', {
				l10n : this.l10n,
				rewards: this.controller.getRewardsCss(),
				presentation_css_class : this.controller.getWindowCss()
			});
			this.bindRewardTooltip();
		},

		bindRewardTooltip : function() {
			var rewards = this.controller.getRewards(),
				$el = this.$el.find('.reward_glow'),
				l10n = this.l10n.tooltips;

			rewards.forEach(function(reward, index) {
				var tooltip = '';

				if (reward.power_id) {
					tooltip = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);
				}
				if (reward.special_reward && reward.special_reward.trophy) {
					tooltip = l10n.trophy[reward.special_reward.trophy];
				}
				if (reward.special_reward && reward.special_reward.arrows) {
					tooltip = l10n.arrows;
				}

				$($el[index]).tooltip(tooltip);

				if (rewards.length === 1) {
					$('.scroll_small >div').tooltip(tooltip);
				}
			});
		},

		initializeOkayButton: function() {
			this.unregisterComponent('btn_okay');
			this.registerComponent('btn_okay', this.$el.find('.btn_okay').button({
				template : 'tpl_simplebutton_borders',
				caption : this.l10n.okay_button
			}).on('btn:click', this.controller.closeMe.bind(this.controller)));
		},

		destroy : function() {
		}
	});

	return SubWindowEnemyDownView;
});
