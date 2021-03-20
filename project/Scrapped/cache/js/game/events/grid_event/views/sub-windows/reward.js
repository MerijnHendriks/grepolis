define('events/grid_event/views/sub-windows/reward', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		ContextMenuHelper = require('helpers/context_menu');

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			var reward = this.controller.getReward(),
				is_sink_reward = this.controller.hasBlockedFigureType();

			this.renderTemplate(this.$el, 'reward', {
				l10n: this.l10n,
				is_sink_reward: is_sink_reward,
				blocked_figure_type: this.controller.getBlockedFigureType()
			});

			this.unregisterComponent('reward_popup');
			this.registerComponent('reward_popup', this.$el.find('.reward').reward({
				reward: reward
			}).on('rwd:click', function (event, reward, position) {
				ContextMenuHelper.showRewardContextMenu(event, reward, position);
			}));
		}
	});
});