/* globals GameEvents */

define('features/daily_login/views/daily_login', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');
	var GameDataDailyBonusStatic = require('features/daily_login/data/daily_bonus_static');
	var ContextMenuHelper = require('helpers/context_menu');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		reRender : function() {
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n,
				highest_count_in_row: GameDataDailyBonusStatic.getLoginInARowHighest(),
				current_day: this.controller.getLevel(),
				total_days: GameDataDailyBonusStatic.getDaysTotal()
			});

			this.renderRewardsTemplate(this.$el.find('.rewards'), {
				is_open: this.controller.isMysteryBoxOpen(),
				gift_id: this.controller.getGiftId(),
				amount: this.controller.getResourcesReward(),
				favor: this.controller.getFavorReward(),
				has_god: this.controller.hasGodInTown()
			});

			if(this.controller.isMysteryBoxOpen()) {
				this.disableResourcesAndFavor();
				this.registerRewardComponent();
			}

			this.registerTooltips();
			this.registerEventsListeners();
		},

		renderRewardsTemplate : function($el, data) {
			$el.empty().html(this.getTemplate('mystery_box', data) +
				this.getTemplate('reward_resources', data) +
				this.getTemplate('reward_favor', data));
		},

		registerTooltips : function() {
			var tooltips_l10n = this.l10n.tooltips;

			this.$el.find('.js-tooltip-best-series').tooltip(tooltips_l10n.your_best_series);

			if(this.controller.isMysteryBoxOpen()) {
				this.registerBoxOpenTooltips();
			} else {
				this.registerBoxClosedTooltips();
			}

			var rewards_list = GameDataDailyBonusStatic.getRewardsList();
			for(var i = 0; i < GameDataDailyBonusStatic.getDaysTotal(); i++) {
				var goblet_rewards = GameDataDailyBonusStatic.getGobletContentForDay(i);
				this.registerDayTooltips(i, rewards_list[i].resources, rewards_list[i].favor, goblet_rewards);
			}
		},

		registerBoxClosedTooltips : function() {
			var tooltips_l10n = this.l10n.tooltips,
				current_day = this.controller.getLevel(),
				goblet_rewards = GameDataDailyBonusStatic.getGobletContentForDay(current_day);

			this.$el.find('.js-tooltip-mystery-box').tooltip(this.getTemplate('daily_login_goblet_tooltip', {
				l10n: tooltips_l10n,
				goblet_rewards : goblet_rewards
			}));
			this.$el.find('.js-tooltip-resources').tooltip(tooltips_l10n.resources);
			this.$el.find('.js-tooltip-favor').tooltip(tooltips_l10n.favor);
			this.$el.find('.js-tooltip-favor.disabled').tooltip(tooltips_l10n.no_god);
		},

		registerBoxOpenTooltips : function() {
			var tooltips_l10n = this.l10n.tooltips;

			this.$el.find('.js-tooltip-mystery-box').tooltip(tooltips_l10n.mystery_box_open);
			this.$el.find('.js-tooltip-resources').tooltip(tooltips_l10n.no_longer_available);
			this.$el.find('.js-tooltip-favor').tooltip(tooltips_l10n.no_longer_available);
		},

		registerDayTooltips : function(day, resources, favor, goblet_rewards) {
			$(this.$el.find('.days_wrapper').children()[day]).tooltip(this.getTemplate('daily_login_days_tooltip', {
				l10n: this.l10n.tooltips,
				current_day : day + 1,
				resources : resources,
				favor: favor,
				goblet_rewards : goblet_rewards
			}));
		},

		registerEventsListeners : function() {
			this.$el.find('.reward.mystery_box').click(this._mysteryBoxClickHandler.bind(this));
			this.$el.find('.reward.resources').click(this._giftClickHandler.bind(this));
			this.$el.find('.reward.favor').click(this._giftClickHandler.bind(this));
		},

		registerRewardButton : function () {
            var $btn_reward = this.$el.find('.btn_reward');

            this.unregisterComponent('rwd_reward');
            this.registerComponent('rwd_reward', $btn_reward.reward({
                reward: this.controller.getRewardData()
            }).on('rwd:click', function (event, reward, position) {
                ContextMenuHelper.showContextMenu(event, position, {
                    data: {
                        event_group: GameEvents.daily_login_bonus.reward,
                        data: reward,
                        level_id: reward.level_id
                    }
                });
            }.bind(this)));
		},

		registerGoldRewardButton : function() {
			var $btn_reward = this.$el.find('.btn_reward'),
				amount = this.$el.find('.mystery_box_animation .amount');

			this.unregisterComponent('rwd_reward_instant_gold');
			this.registerComponent('rwd_reward_instant_gold', $btn_reward.reward({
				reward: this.controller.getRewardData()
			}).on('rwd:click', function (event, reward, position) {
				ContextMenuHelper.showContextMenu(event, position, {
					context_menu: 'item_reward_not_stashable',
					data: {
						event_group: GameEvents.daily_login_bonus.reward,
						data: this.controller.getRewardData(),
						id: 'daily_bonus'
					}
				});
			}.bind(this)));
			amount.text(this.controller.getRewardData().configuration.amount);
			amount.show();
		},

		registerRewardComponent : function () {
			var reward_data = this.controller.getRewardData();
			if (reward_data.power_id === 'instant_gold') {
				this.registerGoldRewardButton();
			} else {
				this.registerRewardButton();
			}
		},

		disableResourcesAndFavor : function() {
			this.$el.find('.js-tooltip-resources').addClass('disabled');
			this.$el.find('.js-tooltip-favor').addClass('disabled');
		},

		startOpenMysteryBoxAnimation : function() {
			this.registerBoxOpenTooltips();
			var $mystery_box_wrapper = this.$el.find('.mystery_box_animation'),
				$mystery_box_reward_glow = this.$el.find('.res.mystery_box'),
				$mystery_box_reward = this.$el.find('.mystery_box_without_glow'),
				$mystery_reward = this.$el.find('.mystery_box_reward'),
				$mystery_box_reward_main = this.$el.find('.js-tooltip-mystery-box'),
				$broken_1 = this.$el.find('.broken_1'),
				$broken_2 = this.$el.find('.broken_2'),
				$broken_3 = this.$el.find('.broken_3'),
				$broken_4 = this.$el.find('.broken_4'),
				$broken_5 = this.$el.find('.broken_5'),
				$broken_6 = this.$el.find('.broken_6'),
				$broken_box_1 = this.$el.find('.broken_box_1'),
				$broken_box_2 = this.$el.find('.broken_box_2'),
				$glow_1 = this.$el.find('.glow_1'),
				$glow_2 = this.$el.find('.glow_2'),
				$glow_3 = this.$el.find('.glow_3'),
				$glow_4 = this.$el.find('.glow_4'),
				$glow_5 = this.$el.find('.glow_5');

			this.registerRewardComponent();
			$mystery_box_wrapper.show();
			$mystery_reward.hide();
			$mystery_box_reward_glow.transition({
				opacity : 0
			}, 600, function () {
				$glow_1.transition({
					opacity : 1
				}, 600);
				$glow_2.transition({
					opacity : 1
				}, 600);
				$glow_3.transition({
					opacity : 1
				}, 200, function () {
					$broken_1.hide();
					$broken_2.hide();
					$broken_3.hide();
					$broken_4.hide();
					$broken_5.hide();
					$broken_6.hide();
					$mystery_box_reward.hide();
					$broken_box_1.transition({
						opacity : 1
					}, 100, function () {
						$broken_box_1.transition({
							opacity : 0
						}, 100, function () {
							$broken_box_1.hide();
						});
						$broken_box_2.transition({
							opacity : 1
						}, 100);
					});
				});
				$glow_4.transition({
					opacity : 1
				}, 600);
				$glow_5.transition({
					opacity : 1
				}, 600, function () {
					$mystery_reward.show();
					$mystery_reward.css('opacity', '1');
					$broken_box_2.transition({
						opacity : 0
					}, 1600, function () {
						$broken_box_2.hide();
					});
					$glow_1.transition({
						opacity : 0
					}, 400, function () {
						$glow_1.hide();
					});
					$glow_2.transition({
						opacity : 1
					}, 400, function () {
						$glow_2.hide();
					});
					$glow_3.transition({
						opacity : 1
					}, 400, function () {
						$glow_3.hide();
					});
					$glow_4.transition({
						opacity : 1
					}, 400, function () {
						$glow_4.hide();
					});
					$glow_5.transition({
						opacity : 0.4
					}, 200, function() {
						$mystery_box_reward_main.addClass('open');
					});
				});
			});
			$broken_1.transition({
				opacity: 1
			}, 100, function () {
				$broken_2.transition({
					opacity: 1
				}, 100, function () {
					$broken_3.transition({
						opacity: 1
					}, 100, function () {
						$broken_4.transition({
							opacity: 1
						}, 100, function () {
							$broken_5.transition({
								opacity: 1
							}, 100, function () {
								$broken_6.transition({
									opacity: 1
								}, 100, function() {
									$mystery_box_reward_glow.hide();
								});
							});
						});
					});
				});
			});
		},

		_giftClickHandler : function(event) {
			var $el = $(event.currentTarget);
			var gift_id = $el.data('gift_id'),
				option = $el.data('option');

			if (!$el.hasClass('disabled')) {
				this.controller.onAcceptRewardBtnClick(gift_id, option);
			}
		},

		_mysteryBoxClickHandler : function() {
			if(!this.controller.isMysteryBoxOpen()) {
				this.disableResourcesAndFavor();
				this.controller.onOpenMysteryBox();
			}
		}
	});
});
