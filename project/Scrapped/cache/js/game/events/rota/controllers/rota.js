/* globals JSON, GameEvents, Promise, GrepoApiHelper, Game, HumanMessage, Timestamp */

define('events/rota/controllers/rota', function () {
	'use strict';

	var TabController = window.GameControllers.TabController,
		RotaView = require('events/rota/views/rota'),
		RewardsListSubController = require('features/rewards_list/controllers/rewards_list'),
		CollectedItemsIndicator = require('features/collected_items/controllers/collected_items_indicator'),
		BenefitHelper = require('helpers/benefit'),
		TutorialHelper = require('features/overlay_tutorial/helpers/tutorial'),
		TUTORIAL_PLAYER_HINT_KEY = 'rota_event_tutorial',
		CurrencyShopFactory = require('features/currency_shop/factories/currency_shop'),
		RotaWindowFactory = require('events/rota/factories/window_factory'),
		DAILY_REWARD_QUALITY = 'special';

	return TabController.extend({
		view: null,

		initialize: function () {
			TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.player_ledger = this.getModel('player_ledger');
			this.player_rota = this.getModel('player_rota');
			this.collected_item_count = this.getModel('rota_event_collected_item_count');
			this.inventory_items = this.getCollection('rota_event_inventory_items');
			this.shop_items = this.getCollection('rota_event_shop_items');
			this.event_data = this.getModel('rota_event_data');
			this.grand_prize_progress = this.getModel('player_happening_main_reward_progress');
			this.painting_elements = this.getCollection('rota_unfinished_painting_elements');

			this.view = new RotaView({
				controller: this,
				el: this.$el
			});

			this.registerEventListeners();
			this.registerCollectedItemsIndicator();
			this.registerResetTimer();

			if (!TutorialHelper.hasBeenCompleted(TUTORIAL_PLAYER_HINT_KEY)) {
				this.showTutorial();
			}
		},

		registerEventListeners: function () {
			this.stopListening();
			this.player_ledger.onRotaTycheCoinsChage(this, this.handleCurrencyChange.bind(this));
			this.collected_item_count.onCollectedItemChange(this, function () {
				this.getController('collected_drops').reRender({
					items: this.collected_item_count.getPreparedItems(),
					items_count: this.collected_item_count.getItemCount()
				});
			}.bind(this));
			this.inventory_items.onAddOrRemove(this, this.view.renderEventInventory.bind(this.view));

			this.player_rota.onDoubleRewardProgressChange(this, this.view.updateDoubleRewardProgress.bind(this.view));
			this.player_rota.onGrandPrizeIndexToCollectChange(this, this.handleGrandPrizeReadyOrCollected.bind(this));
			this.grand_prize_progress.onShardProgressChange(this, this.view.updateGrandPrizeProgress.bind(this.view));
			this.grand_prize_progress.onRewardsChange(this, this.view.registerGrandPrizePreview.bind(this.view));
			this.painting_elements.onAdd(this, this.view.fadeInPaintingElement.bind(this.view));

			// Event inventory rewards
			this.stopObservingEvent(GameEvents.active_happening.inventory.use);
			this.stopObservingEvent(GameEvents.active_happening.inventory.stash);
			this.stopObservingEvent(GameEvents.active_happening.inventory.trash);
			this.observeEvent(GameEvents.active_happening.inventory.use, this.handleInventoryItem.bind(this));
			this.observeEvent(GameEvents.active_happening.inventory.stash, this.handleInventoryItem.bind(this));
			this.observeEvent(GameEvents.active_happening.inventory.trash, this.handleInventoryItem.bind(this));

			// Grand prize rewards
			this.stopObservingEvent(GameEvents.active_happening.reward.stash);
			this.stopObservingEvent(GameEvents.active_happening.reward.trash);
			this.stopObservingEvent(GameEvents.active_happening.reward.use);
			this.observeEvent(GameEvents.active_happening.reward.stash, this.stashGrandPrize.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.trash, this.trashGrandPrize.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.use, this.utilizeGrandPrize.bind(this));
		},

		registerCollectedItemsIndicator: function () {
			this.unregisterController('collected_drops');
			var controller = this.registerController('collected_drops', new CollectedItemsIndicator({
				parent_controller: this,
				settings: {
					items: this.collected_item_count.getPreparedItems(),
					items_count: this.collected_item_count.getItemCount(),
					l10n: this.l10n.collected_items_indicator,
					tooltip: {
						css_classes: BenefitHelper.getBenefitSkin(),
						x_value_prefix: true
					}
				}
			}));

			controller.renderPage();
		},

		registerResetTimer: function () {
			var time_left = (this.player_rota.getResetTime() - Timestamp.now()) * 1000;

			this.unregisterTimer('next_auto_reset');
			this.registerTimer('next_auto_reset', time_left, function () {
				this.performAutoReset();
			}.bind(this), {max : 1});
		},

		performAutoReset: function () {
			if (this.view.spin_animation_running) {
				this.unregisterTimer('delay_reset');
				this.registerTimer('delay_reset', 500, function () {
					this.performAutoReset();
				}.bind(this), {max: 1});

				return;
			}

			this.closeWindow();
			RotaWindowFactory.openWindow();
		},

		getTutorialOrder: function() {
			return [
				'step_1',
				'step_2',
				'step_3',
				'step_4',
				'step_5',
				'step_6',
				'step_7',
				'step_8',
				'step_9',
				'step_10',
				'step_11'
			];
		},

		getTutorialStepText: function (step) {
			var result = this.l10n.tutorial[step];

			if (step === 'step_4') {
				result = result(this.getSpinCost());
			} else if (step === 'step_5') {
				result = result(this.event_data.getResetCost() + this.getSpinCost());
			}

			return result;
		},

		showTutorial: function () {
			TutorialHelper.showTutorial(this, TUTORIAL_PLAYER_HINT_KEY);
			this.$el.find('.classic_sub_window_curtain').hide();
		},

		getAvailableCurrency: function () {
			return this.player_ledger.getRotaTycheCoins();
		},

		handleCurrencyChange: function () {
			this.view.updateCurrency();
			this.view.updateButtons();
		},

		getRewards: function () {
			var rewards = [];

			this.player_rota.getAvailableSlots()
				.sort(function (a, b) { return a.slot_position - b.slot_position;})
				.forEach(function (slot) {
					var reward = {
						data: JSON.parse(slot.reward_configuration),
						disabled: slot.chance === 0,
						chance: slot.chance,
						slot_position: slot.slot_position,
						quality: slot.quality
					};

					rewards.push(reward);
				}
			);

			return rewards;
		},

		isDailySpecialReward: function (slot) {
			return slot.quality === DAILY_REWARD_QUALITY;
		},

		getDailySpecialReward: function () {
			var daily_special = this.player_rota.getSlots().find(this.isDailySpecialReward);

			return JSON.parse(daily_special.reward_configuration);
		},

		handleSpinClick: function (resolve, reject) {
			this.player_rota.spin(resolve, reject);
		},

		handleReset: function () {
			if (this.getAvailableCurrency() < this.getResetCost()) {
				HumanMessage.error(this.l10n.insufficient_currency);

				return;
			}

			this.player_rota.reset(
				this.view.handleResetResponse.bind(this.view),
				this.view.resetWheel.bind(this.view)
			);
		},

		isWheelEmpty: function () {
			var available_slot = this.player_rota.getSlots().find(function (slot) {
				return slot.available;
			});

			return typeof available_slot === 'undefined';
		},

		getSpinCost: function () {
			return this.event_data.getSpinCost();
		},

		getResetCost: function () {
			if (!this.isWheelEmpty()) {
				return this.event_data.getResetCost() + this.getSpinCost();
			} else {
				return this.getSpinCost();
			}
		},

		canSpinWheel: function () {
			return this.hasEnoughFreeInventorySlots() && !this.isGrandPrizeReadyToCollect();
		},

		canResetWheel: function () {
			return this.hasEnoughFreeInventorySlots() && !this.isGrandPrizeReadyToCollect();
		},

		hasEnoughFreeInventorySlots: function () {
			var limit = this.getInventoryLimit();

			if (this.isDoubleRewardActive()) {
				limit--;
			}

			return this.getEventInventoryItemCount() < limit;
		},

		getEventInventoryItemIds: function () {
			return this.inventory_items.getItemIds();
		},

		getEventInventoryItemProperties: function (item_id) {
			return this.inventory_items.getItemProperties(item_id);
		},

		getEventInventoryItemCount: function () {
			return this.inventory_items.getItemsCount();
		},

		getInventoryLimit: function () {
			return this.event_data.getInventoryLimit();
		},

		getDoubleRewardProgress: function () {
			return this.player_rota.getDoubleRewardProgress();
		},

		getDoubleRewardThreshold: function () {
			return this.event_data.getDoubleRewardThreshold();
		},

		isDoubleRewardActive: function () {
			return (1 + this.getDoubleRewardProgress()) >= this.getDoubleRewardThreshold();
		},

		getOriginalSize: function () {
			return this.player_rota.getOriginalSize();
		},

		getGrandPrizeThreshold: function () {
			return this.event_data.getGrandPrizeThreshold();
		},

		getGrandPrizeProgress: function () {
			return this.grand_prize_progress.getShardProgress();
		},

		getGrandPrizeToCollect: function () {
			return this.getGrandPrizes()['0'];
		},

		getGrandPrizes: function () {
			return this.grand_prize_progress.getNextRewards();
		},

		isGrandPrizeReadyToCollect: function() {
			return this.player_rota.getGrandPrizeIndexToCollect() !== null;
		},

		handleInventoryItem: function (event, reward_data) {
			var	promise;

			this.showLoading();

			switch (event.type) {
				case GameEvents.active_happening.inventory.use:
					promise = this.inventory_items.get(reward_data.id).useReward();
					break;
				case GameEvents.active_happening.inventory.stash:
					promise = this.inventory_items.get(reward_data.id).stashReward();
					break;
				case GameEvents.active_happening.inventory.trash:
					promise = this.inventory_items.get(reward_data.id).trashReward();
					break;
				default:
					promise = Promise.resolve();
			}

			promise.then(this.handleInventoryItemResponse.bind(this));
		},

		handleInventoryItemResponse: function() {
			this.hideLoading();
			this.view.updateOverlayAndButtons();
		},

		openRewardsListSubWindow: function () {
			var controller = new RewardsListSubController({
				window_controller: this,
				l10n: this.l10n,
				rewards: this.getRewards(),
				settings: {
					show_rewards_disabled: true
				},
				templates: {
					rewards_list: this.getTemplate('rewards_list'),
					rewards_list_reward: this.getTemplate('rewards_list_reward')
				},
				cm_context: {
					main: this.getMainContext(),
					sub: 'sub_window_rewards_list'
				}
			});

			this.openSubWindow({
				title: this.l10n.rewards_list.title,
				controller: controller,
				skin_class_names: 'classic_sub_window'
			});
		},

		openCurrencyShop: function () {
			CurrencyShopFactory.openWindow(this, this.shop_items);
		},

		handleGrandPrizeReadyOrCollected: function() {
			this.view.updateOverlayAndButtons();

			if (!this.isGrandPrizeReadyToCollect()) {
				this.painting_elements.reFetch(this.view.resetPainting.bind(this.view));
			}
		},

		stashGrandPrize: function () {
			GrepoApiHelper.execute.call(this, 'RotaGrandPrize', 'stash');
		},

		trashGrandPrize: function () {
			GrepoApiHelper.execute.call(this, 'RotaGrandPrize', 'trash');
		},

		utilizeGrandPrize: function () {
			GrepoApiHelper.execute.call(this, 'RotaGrandPrize', 'utilize');
		},

		getEventEndAt: function () {
			return BenefitHelper.getEventEndAt();
		},

		getEventTimeLeft: function () {
			return this.getEventEndAt() - Timestamp.now();
		},

		getPaintingElements: function () {
			return this.painting_elements.getPaintingElements();
		},

		hasPaintingElements: function () {
			return this.getPaintingElements().length > 0;
		},

		getPaintingImagePath: function (image_id) {
			return Game.game_url + '/images/game/events/rota/christmas/' + image_id + '.png';
		},

		clearPaintingElements: function () {
			this.painting_elements.remove(this.getPaintingElements());
		}
	});
});
