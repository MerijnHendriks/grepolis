define('events/spawn/views/sub_window_reward', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowRewardView = View.extend({

		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
			this.initializeOkayButton();
		},

		render : function() {
			this.renderTemplate(this.$el, 'sub_window_reward', {
				l10n : this.l10n,
				reward_amounts: this.controller.getRewards(),
				mission: this.controller.getMission()
			});
			this.bindRewardTooltip();
		},

		bindRewardTooltip : function() {
			var rewards = this.controller.getRewards(),
				setTooltip = function(reward) {
					var tooltip = this.l10n.reward_tooltips[reward];
					this.$el.find('.reward.' + reward).parent().tooltip(tooltip);
				}.bind(this);

			Object.keys(rewards).forEach(setTooltip);
		},

		initializeOkayButton: function() {
			var onClaimClicked = this.controller.onClaimClicked.bind(this.controller);

			this.unregisterComponent('btn_okay');
			this.registerComponent('btn_okay', this.$el.find('.btn_okay').button({
				template : 'tpl_simplebutton_borders',
				caption : this.l10n.button
			}).on('btn:click', onClaimClicked));
		},

		destroy : function() {
		}
	});

	return SubWindowRewardView;
});
