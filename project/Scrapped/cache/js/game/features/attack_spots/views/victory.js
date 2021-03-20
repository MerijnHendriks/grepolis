define('features/attack_spots/views/victory', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');
	var GameDataPowers = require('data/powers');
	var GameEvents = require('data/events');
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
	var ResourceRewardDataFactory = require('factories/resource_reward_data_factory');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n,
				rewards: [this.controller.getReward()]
			});

			this.registerViewComponents();
			this.registerRewards();
		},

		registerViewComponents: function() {
			var reward = this.controller.getReward(),
				not_stashable = reward.stashable === false;

			this.unregisterComponents();
			if (not_stashable) {
				var reward_data_for_waste_check = ResourceRewardDataFactory.fromRewardPowerData(reward);

				this.registerComponent('btn_collect', this.$el.find('.btn_collect').button({
					caption: this.l10n.collect
				}).on('btn:click', function() {
					ConfirmationWindowFactory.openConfirmationWastedResources(function() {
						this.controller._rewardAction('use');
					}.bind(this), null, reward_data_for_waste_check);
				}.bind(this)));
			} else {
				this.registerComponent('btn_collect', this.$el.find('.btn_collect').button({
					template: 'tpl_button_simple_reward',
					submenu_data : {
						id: 'attack_spot',
						event_group: GameEvents.attack_spot.reward,
						reward_data: this.controller.getReward()
					},
					submenu_class : 'gp_item_reward_all',
					caption: this.l10n.collect
				}));
			}
		},

		registerRewards : function() {
			var reward = this.controller.getReward(),
				$reward = this.$el.find('.reward.' + GameDataPowers.getCssPowerId(reward));

			this.unregisterComponents('rewards');
			this.registerComponent('reward', $reward.reward({
				reward: reward,
				size: 60
			}), 'rewards');
		}
	});
});
