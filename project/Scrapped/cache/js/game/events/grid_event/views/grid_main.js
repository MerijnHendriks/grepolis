/* global GameEvents, Promise */
define('events/grid_event/views/grid_main', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		Timestamp = window.Timestamp,
		TURN_CURRENCY_COMPONENT = 'turn_currency_indicator',
		PROGRESSION_CURRENCY_COMPONENT = 'progression_currency_indicator',
		GRIDEVENT_HARPY_SCOUT = 'gridevent_harpy_scout',
		GRIDEVENT_DOUBLE_REWARD = 'gridevent_double_reward',
		ContextMenuHelper = require('helpers/context_menu');

	return BaseView.extend({
		animation_data : {
			start_x : 196, //left position of the grid
			start_y : 84, //top position of the grid
			half_cell : 34, //half of one grid cell size
			immediately: 0
		},
		special_reward_positions: {
			gridevent_harpy_scout: {
				x: 450,
				y: 460
			},
			gridevent_double_reward: {
				x: 506,
				y: 460
			}
		},

		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'main', {
				l10n: this.l10n,
				invisible: this.controller.is_reset ? 'invisible' : ''
			});


			this.registerEventCountdown();
			this.registerOpenTutorialButton();
			this.registerCurrencyIndicators();
			this.registerOpenShopButton();
			this.renderGrandPrizeDisplayAndRegisterRewards();
			this.renderInventoryAndRegisterRewards(false);
			this.registerGrandPrizeTooltip();
			this.registerDailySpecialReward();
			this.registerDailySpecialRewardTooltip();
			this.registerSpendShardsButton();
			this.registerSpecialEventRewardTooltips();
			this.updateSpecialEventRewardIndicators();
		},

		registerEventCountdown: function () {
			var $countdown = this.$el.find('.countdown_box .countdown');

			this.unregisterComponent('event_countdown');
			this.registerComponent('event_countdown', $countdown.countdown2({
				value: this.controller.getEventEndAt() - Timestamp.now(),
				display: 'event',
				tooltip: { title: this.l10n.tooltips.event_time_left }
			}));
		},

		registerOpenTutorialButton: function () {
			this.unregisterComponent('open_tutorial_button');
			this.registerComponent('open_tutorial_button', this.$el.find('.btn_open_tutorial').button({
				template: 'internal',
				tooltips: [{ title: this.l10n.tooltips.event_info_button }]
			}).on('btn:click', this.controller.onOpenTutorialButtonClick.bind(this.controller)));
		},

		registerOpenShopButton: function () {
			var $button = this.$el.find('.btn_open_shop');

			this.unregisterComponent('btn_open_shop');
			this.registerComponent('btn_open_shop', $button.button({
				caption: '+',
				tooltips: [{ title: this.l10n.tooltips.btn_open_shop }]
			}).on('btn:click', this.controller.onOpenShopButtonClick.bind(this.controller)));
		},

		registerCurrencyIndicators: function () {
			var $turn_currency_wrapper = this.$el.find('.turn_currency_wrapper'),
				$turn_currency = $turn_currency_wrapper.find('.value'),
				$progression_currency_wrapper = this.$el.find('.progression_currency_wrapper'),
				$progression_currency = $progression_currency_wrapper.find('.value'),
				l10n = this.l10n.tooltips;

			this.unregisterComponent(TURN_CURRENCY_COMPONENT);
			this.registerComponent(TURN_CURRENCY_COMPONENT, $turn_currency.numberChangeIndicator({
				caption: this.controller.getGridCurrency()
			}));

			$turn_currency_wrapper.tooltip(l10n.turn_currency);

			this.unregisterComponent(PROGRESSION_CURRENCY_COMPONENT);
			this.registerComponent(PROGRESSION_CURRENCY_COMPONENT, $progression_currency.numberChangeIndicator({
				caption: this.controller.getGridProgressionCurrency()
			}));

			$progression_currency_wrapper.tooltip(l10n.progression_currency);
		},

		renderGrandPrizeDisplayAndRegisterRewards: function () {
			var l10n = this.controller.getl10n(),
				$grand_prize_rewards = this.$el.find('.grand_prize_rewards'),
				template = this.getTemplate('grand_prize_reward_display', {
					l10n: l10n.reward.grand_prize
				});
			$grand_prize_rewards.html(template);
			$grand_prize_rewards.find('.next_text').tooltip(l10n.reward.grand_prize.next);

			this.registerGrandPrizeRewards();
		},

		registerGrandPrizeRewards: function () {
			var rewards = this.controller.getGrandPrizeRewards();
			for (var i = 0; i < rewards.length; i++) {
				var $reward = this.$el.find('.grand_prize_' + i);
				this.unregisterComponent('grand_reward_' + i);
				this.registerComponent('grand_reward_' + i, $reward.reward({
					reward: rewards[i],
					size: i === 0 ? 60 : 30
				}));
			}
		},

		registerGrandPrizeTooltip: function () {
			var l10n = this.controller.getl10n(),
				tooltip_text = l10n.tooltips.grand_prize.info_icon,
				tooltip = this.getTemplate('info_icon_tooltip', {
					l10n: tooltip_text
				});

			this.$el.find('.grand_prize_rewards_wrapper .info_icon').tooltip(tooltip);
		},

		renderInventoryAndRegisterRewards: function (is_animated, id_of_last_changed) {
			var $inventory = this.$el.find('.inventory_items'),
				item_ids = this.controller.getInventoryItemIds(),
				$cloned_inventory_item = this.$el.find('#cloned_inventory_item');

			$inventory.empty();
			item_ids.forEach(function (id) {
				var $item = $('<div class="item" ></div>'),
					is_item_cloned = $cloned_inventory_item.find('.item[data-item_id='+id+']').length;
				$item.attr('data-item_id', id);

				this.unregisterComponent('inventory_item_' + id);
				this.registerComponent('inventory_item_' + id, $item.reward({
					reward: this.controller.getInventoryItemProperties(id),
					size: 30
				}).on('rwd:click', function (event, reward, position) {
					var data = {
						event_group: GameEvents.active_happening.inventory,
						data: reward,
						id: reward.data('item_id')
					};

					ContextMenuHelper.showContextMenu(event, position, {data: data});
				}));

				if ((id === id_of_last_changed || is_item_cloned) && is_animated) {
					$cloned_inventory_item.empty();
					$item.clone().appendTo($cloned_inventory_item);
					$item.addClass('invisible');
				}

				$inventory.append($item);
			}.bind(this));
		},

		registerDailySpecialReward: function () {
			var $reward = this.$el.find('.daily_special_reward'),
				daily_sepcial_reward = this.controller.getDailySpecialReward();
			this.unregisterComponent('daily_sepcial_reward');
			this.registerComponent('daily_sepcial_reward', $reward.reward({
				reward: daily_sepcial_reward,
				size: 60
			}));
		},

		registerDailySpecialRewardTooltip: function () {
			var l10n = this.controller.getl10n(),
				tooltip_text = l10n.tooltips.daily_special.info_icon,
				tooltip = this.getTemplate('info_icon_tooltip', {
					l10n: tooltip_text
				});

			this.$el.find('.daily_special_reward_wrapper .info_icon').tooltip(tooltip);
		},

		registerSpendShardsButton: function () {
			var $btn = this.$el.find('.btn_spend_shards'),
				l10n = this.controller.getl10n(),
				cost = this.controller.getCost(),
				disabled = this.controller.hasEnoughCurrency();

			this.unregisterComponent('btn_spend_shards');
			this.registerComponent('btn_spend_shards', $btn.button({
				caption: cost,
				icon: true,
				icon_type: 'map_currency',
				toggle: true,
				disabled: disabled,
				state: disabled,
				tooltips: [
					{title: l10n.tooltips.btn_spend_shards},
					{title: this.getDisabledSpendShardsButtonTooltip.bind(this)}
				]
			}).on('btn:click', function () {
				this.controller.spendShardsAndOpenGrandPrizeJourneySubWindow();
			}.bind(this)));
		},

		getDisabledSpendShardsButtonTooltip: function () {
			var l10n = this.controller.getl10n();
			return this.controller.turn_animation_running ?
				l10n.tooltips.btn_spend_disabled_no_progress : l10n.tooltips.btn_spend_disabled_no_map_pieces;
		},

		updateSpendShardsButton: function () {
			var btn_component = this.getComponent('btn_spend_shards'),
				disabled = this.controller.hasEnoughCurrency() || this.controller.turn_animation_running;

			btn_component.setState(disabled);
			btn_component.disable(disabled);
		},

		updateTurnCurrency: function () {
			var component = this.getComponent(TURN_CURRENCY_COMPONENT);
			if (component) {
				component.setCaption(this.controller.getGridCurrency());
			}
		},

		updateProgressionCurrency: function () {
			var component = this.getComponent(PROGRESSION_CURRENCY_COMPONENT);
			if (component) {
				component.setCaption(this.controller.getGridProgressionCurrency());
			}
		},

		fadeOutGridAndFigureRewards: function () {
			this.controller.is_fade_out_animation_running = true;
			this.$el.find('.player_grid').transition({
				opacity: 0
			}, 500, 'ease');
			this.$el.find('.figure_rewards').transition({
				opacity: 0
			}, 500, 'ease', function() {
				this.controller.is_fade_out_animation_running = false;
			}.bind(this));
		},


		fadeInGridAndFigureRewards: function () {
			this.$el.find('.player_grid').transition({
				opacity: 1
			}, 500, 'ease', function() {
				this.$el.removeClass('invisible');
			}.bind(this));
			this.$el.find('.figure_rewards').transition({
				opacity: 1
			}, 500, 'ease', function() {
				this.$el.find('.figure_rewards').removeClass('invisible');
				this.controller.is_reset = false;
			}.bind(this));
		},

		updateSpecialEventRewardIndicators: function () {
			var scout_active = this.controller.isScoutActive(),
				reward_multiplier_active = this.controller.isRewardMultiplierActive(),
				$special_event_rewards = this.$el.find('.special_event_rewards'),
				$scout = $special_event_rewards.find('.scout'),
				$reward_multiplier = $special_event_rewards.find('.reward_multiplier');

			$scout.toggleClass('active', scout_active);
			$reward_multiplier.toggleClass('active', reward_multiplier_active);
		},

		registerSpecialEventRewardTooltips: function () {
			var $special_event_rewards = this.$el.find('.special_event_rewards'),
				$scout = $special_event_rewards.find('.scout'),
				$reward_multiplier = $special_event_rewards.find('.reward_multiplier');

			$scout.tooltip(this.controller.getEventPowerTooltip(GRIDEVENT_HARPY_SCOUT));
			$reward_multiplier.tooltip(this.controller.getEventPowerTooltip(GRIDEVENT_DOUBLE_REWARD));
		},


		startAnimationWithoutBackendData: function ($grid_cell, available_scouts) {
			var $animated_icon = this.$el.find('.animated_icon');
			return new Promise(function(resolve) {
				if (available_scouts > 0) {
					this.startScoutAnimation($animated_icon, $grid_cell, resolve);
				} else if ($grid_cell.hasClass('uncovered')) {
					this.animateTurnCurrencyAndSplashWithHidingUncoveredSpot($grid_cell, $animated_icon, resolve);
				} else {
					this.animateTurnCurrencyAndSplash($grid_cell, $animated_icon, resolve);
				}
			}.bind(this));
		},

		startScoutAnimation: function ($animated_icon, $grid_cell, resolve) {
			$animated_icon.addClass('animated_scout');
			$animated_icon.transition({
				x : this.animation_data.start_x + $grid_cell.position().left + 20,
				y: this.animation_data.start_y + $grid_cell.position().top + 8,
				opacity: 1,
				scale: 0
			}, this.animation_data.immediately, function () {
				resolve({resolved: true});
			});
			$animated_icon.transition({scale: 1, opacity: 1}, 500);
		},

		animateTurnCurrencyAndSplashWithHidingUncoveredSpot: function ($grid_cell, $animated_icon, resolve) {
			var $result = $grid_cell.find('.result');
			var $icon = $grid_cell.find('.icon');
			$icon.transition({opacity: 0, scale: 0}, 350, 'ease');
			$result.transition({opacity: 0, scale: 0}, 350, 'ease', function () {
				$grid_cell.removeClass('uncovered');
				this.animateTurnCurrencyAndSplash($grid_cell, $animated_icon, resolve);
			}.bind(this));
		},

		animateTurnCurrencyAndSplash: function ($grid_cell, $animated_icon, resolve) {
			var $animated_turn_currency = this.$el.find('.animated_turn_currency'),
				square_position = $grid_cell.position(),
				new_x_position = this.animation_data.start_x + square_position.left + this.animation_data.half_cell,
				new_y_position = this.animation_data.start_y + square_position.top + this.animation_data.half_cell;

			$animated_icon.addClass('animated_splash');
			$animated_turn_currency.transition({ x: 650, y: 10, opacity: 0}, this.animation_data.immediately);
			$animated_icon.transition({
				x : this.animation_data.start_x + square_position.left + 15,
				y: this.animation_data.start_y + square_position.top,
				opacity: 1,
				scale: 0
			}, this.animation_data.immediately);
			$animated_turn_currency.transition({ opacity: 1 }, 200, 'ease');
			$animated_turn_currency.transition({ x : new_x_position, y : new_y_position}, 500, 'linear', function() {
				$animated_turn_currency.transition({ x: 650, y: 10, opacity: 0}, this.animation_data.immediately);
				$animated_icon.transition({scale: 1, opacity: 1}, 500, function () {
					resolve({resolved: true});
				});
			}.bind(this));
		},

		startAnimationWithBackendData: function (promise_data, resolve) {
			var $animated_icon = this.$el.find('.animated_icon');
			var animated_icon_position = $animated_icon.position(),
				reward_type = promise_data.getRewardType().toLowerCase(),
				animate_reward = promise_data.isRewardClaimed();

			$animated_icon.transition({scale: 0, opacity: 0}, 500, function () {
				$animated_icon.removeClass('animated_splash animated_scout');
				$animated_icon.attr('style', '');

				if (animate_reward) {
					this.animateMovingReward(animated_icon_position, reward_type);
				}

				this.controller.getController('player_grid').handlePlayerGridTurnChange(promise_data, resolve);
			}.bind(this));
		},

		animateMovingReward: function (animated_icon_position, reward_type) {
			var $cloned_reward = this.$el.find('#cloned_inventory_item'),
				cloned_reward_item_id = $cloned_reward.find('.item').data('item_id'),
				$inventory_items = this.$el.find('.inventory_items'),
				$inventory_item = $inventory_items.find('.item[data-item_id=' + cloned_reward_item_id + ']'),
				is_special_reward = this.special_reward_positions.hasOwnProperty(reward_type),
				end_position;
			this.controller.reward_animation_running = true;

			var left_position = animated_icon_position.left + 5,
				top_position = animated_icon_position.top - 5;

			if (cloned_reward_item_id) {
				end_position = {
					x: 220 + $inventory_item.position().left,
					y: 450
				};
			} else if (is_special_reward) {
				$cloned_reward.append('<div class="' + reward_type + '"></div>');
				end_position = this.special_reward_positions[reward_type];
			}

			$cloned_reward.transition({x: left_position, y: top_position}, 0);
			$cloned_reward.transition({scale: 1.5, opacity: 1}, 250, 'ease', function () {
				$cloned_reward.transition({
					scale: 1,
					x: end_position.x,
					y: end_position.y,
					delay: 300
				}, 500, 'ease', function () {
					$cloned_reward.empty();
					$cloned_reward.attr('style', '');

					if (cloned_reward_item_id) {
						$inventory_items.find('.item.invisible').removeClass('invisible');
					}
					this.controller.reward_animation_running = false;
				}.bind(this));
			}.bind(this));
		}
	});
});