define('features/rewards_list/views/rewards_list', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			var rewards = this.controller.getRewards(),
				rewards_fragment = this.renderRewardsToFragment(rewards);

			this.renderTemplate(this.$el, 'rewards_list', {
				l10n: this.l10n.rewards_list,
				show_description: typeof this.l10n.description !== 'undefined'
			});

			this.$el.find('.rewards_list').html(rewards_fragment);
			this.registerScrollbar();
		},

		renderRewardsToFragment: function (rewards) {
			var fragment = document.createDocumentFragment();

			rewards.forEach(function (reward, index) {
				var data = reward.data,
					title = this.controller.getPowerName(data),
					$list_element = $(this.getTemplate('rewards_list_reward', {
						l10n: this.l10n.rewards_list,
						index: index,
						power: data.power_id || data.type,
						title: title,
						reward: reward
					})),
					$reward = $list_element.find('.reward');

				this.registerRewards($reward, reward, index);
				$list_element.appendTo(fragment);
			}.bind(this));

			return fragment;
		},

		registerScrollbar: function () {
			var $list_container = this.$el.find('.list_container');

			this.unregisterComponent('scrollbar_rewards_list');
			this.registerComponent('scrollbar_rewards_list', $list_container.skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'blue',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				scroll_position: 0,
				min_slider_size: 16,
				hide_when_nothing_to_scroll: true
			}), this.sub_context);
		},

		registerRewards: function ($reward, reward, index) {
			var disabled = this.controller.showRewardsAsDisabled() ? reward.disabled : false;

			if (reward.data.configuration) {
				this.unregisterComponent('rwd_reward_' + index);
				this.registerComponent('rwd_reward_' + index, $reward.reward({
					reward: reward.data,
					size: 45,
					disabled: disabled
				}));
			} else {
				$reward.toggleClass('disabled', disabled);
				$reward.tooltip(this.controller.getEventPowerTooltip(reward.data.type));
			}
		}
	});
});