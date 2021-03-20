/* globals GameEvents, TM, Promise */
define('events/grid_event/controllers/grid_main', function () {
	'use strict';

	var TabController = window.GameControllers.TabController,
		GridMainView = require('events/grid_event/views/grid_main'),
		FigureRewardsController = require('events/grid_event/controllers/figure_rewards'),
		PlayerGridController = require('events/grid_event/controllers/player_grid'),
		ProgressionMovementController = require('events/grid_event/controllers/progression_movement'),
		CollectedItemsIndicator = require('features/collected_items/controllers/collected_items_indicator'),
		RewardSubWindowController = require('events/grid_event/controllers/sub-windows/reward'),
		GrandPrizeJourneySubWindowController = require('events/grid_event/controllers/sub-windows/grand_prize_journey'),
		BenefitHelper = require('helpers/benefit'),
		RewardsListSubController = require('features/rewards_list/controllers/rewards_list'),
		GridEventWindowFactory = require('events/grid_event/factories/window_factory'),
		GridState = require('events/grid_event/enums/grid_state'),
		TutorialHelper = require('features/overlay_tutorial/helpers/tutorial'),
		CurrencyShopFactory = require('features/currency_shop/factories/currency_shop'),
		TUTORIAL_PLAYER_HINT_KEY = 'grid_event_tutorial';

	return TabController.extend({
		view: null,
		is_fade_out_animation_running: false,
		is_reset: false,
		turn_animation_running: false,
		reward_animation_running: false,

		initialize: function () {
			TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.grid_event_collected_item_count = this.getModel('grid_event_collected_item_count');
			this.main_reward_progress_model = this.getModel('player_happening_main_reward_progress');
			this.view = new GridMainView({
				controller: this,
				el: this.$el
			});

			this.registerCollectedItemsIndicator();
			this.initializeFigureRewards();
			this.initializePlayerGrid();
			this.initializeProgressionMovement();

			this.renderView();
			this.registerEventListeners();

			this.openRewardWindowIfRewardCanBeCollected();

			if (!TutorialHelper.hasBeenCompleted(TUTORIAL_PLAYER_HINT_KEY)) {
				TutorialHelper.showTutorial(this, TUTORIAL_PLAYER_HINT_KEY);
			}
		},

		registerEventListeners: function () {
			var player_ledger = this.getPlayerLedger(),
				player_grid = this.getPlayerGrid(),
				inventory_items = this.getInventoryItemsCollection();

			this.stopListening();
			this.stopObservingEvent(GameEvents.active_happening.inventory.use);
			this.stopObservingEvent(GameEvents.active_happening.inventory.stash);
			this.stopObservingEvent(GameEvents.active_happening.inventory.trash);

			player_ledger.onGridCurrencyChange(this, this.handleGridCurrencyChange.bind(this));
			player_ledger.onGridProgressionCurrencyChange(this, this.onProgressionCurrencyChanged.bind(this));

			this.main_reward_progress_model.onRewardsChange(this, this.view.renderGrandPrizeDisplayAndRegisterRewards.bind(this.view));

			this.grid_event_collected_item_count.onCollectedItemChange(this, function () {
				this.getController('collected_drops').reRender({
					items: this.grid_event_collected_item_count.getPreparedItems(),
					items_count: this.grid_event_collected_item_count.getItemCount()
				});
			});

			player_grid.onRewardQuantityMultiplierChange(this, this.view.updateSpecialEventRewardIndicators.bind(this.view));
			player_grid.onAvailableScoutsChange(this, this.view.updateSpecialEventRewardIndicators.bind(this.view));
			inventory_items.onAddOrRemove(this, this.handleInventoryItems.bind(this));

			this.observeEvent(GameEvents.active_happening.inventory.use, this.useInventoryItem.bind(this));
			this.observeEvent(GameEvents.active_happening.inventory.stash, this.stashInventoryItem.bind(this));
			this.observeEvent(GameEvents.active_happening.inventory.trash, this.trashInventoryItem.bind(this));
		},

		getPlayerGrid: function () {
			return this.getModel('player_grid');
		},

		initializePlayerGrid: function () {
			this.unregisterController('player_grid');
			this.registerController('player_grid', new PlayerGridController({
				el: this.$el,
				parent_controller: this
			}));
		},

		initializeFigureRewards: function () {
			this.unregisterController('figure_rewards');
			this.registerController('figure_rewards', new FigureRewardsController({
				el: this.$el,
				parent_controller: this
			}));
		},

		initializeProgressionMovement: function () {
			this.unregisterController('progression_movement');
			this.registerController('progression_movement', new ProgressionMovementController({
				el: this.$el,
				parent_controller: this
			}));
		},

		getPlayerLedger: function () {
			return this.getModel('player_ledger');
		},

		getGridEventShopItems: function () {
			return this.getCollection('grid_event_shop_items');
		},

		getInventoryItemsCollection: function () {
			 return this.getCollection('grid_event_inventory_items');
		},

		getPlayerGridTurns: function () {
			return this.getCollection('player_grid_turns');
		},

		getGridCurrency: function () {
			return this.getPlayerLedger().getGridCurrency();
		},

		getGridProgressionCurrency: function () {
			return this.getPlayerLedger().getGridProgressionCurrency();
		},

		hasEnoughCurrency: function () {
			return this.getGridProgressionCurrency() < this.getCost();
		},

		getEventEndAt: function () {
			return BenefitHelper.getEventEndAt();
		},

		getDailySpecialReward: function () {
			return this.getPlayerGrid().getDailyReward();
		},

		handleGridCurrencyChange: function () {
			this.view.updateTurnCurrency();
			this.getController('player_grid').updateResetGridButton();
		},

		handleInventoryItems: function (model) {
			var last_changed_item_id = model.getId();
			this.view.renderInventoryAndRegisterRewards(true, last_changed_item_id);
		},

		onProgressionCurrencyChanged: function () {
			this.view.updateProgressionCurrency();
			this.view.updateSpendShardsButton();
		},

		renderView: function () {
			this.getController('collected_drops').renderPage();
			this.getController('figure_rewards').renderPage();
			this.getController('player_grid').renderPage();
			this.getController('progression_movement').renderPage();
		},

		renderViewAfterReset: function () {
			if (this.is_fade_out_animation_running) {
				TM.unregister('render_view_after_reset');
				TM.register('render_view_after_reset', 200, this.renderViewAfterReset.bind(this), {max : 1});
				return;
			}
			this.view.render();
			this.renderView();
			this.view.fadeInGridAndFigureRewards();
		},

		onOpenShopButtonClick: function () {
			CurrencyShopFactory.openWindow(this, this.getGridEventShopItems());
		},

		openRewardsListSubWindow: function () {
			var controller = new RewardsListSubController({
				window_controller: this,
				l10n: this.l10n,
				rewards: this.getPlayerGridTurns().getRewards(),
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

		registerCollectedItemsIndicator: function () {
			this.unregisterController('collected_drops');
			this.registerController('collected_drops', new CollectedItemsIndicator({
				parent_controller: this,
				settings: {
					items: this.grid_event_collected_item_count.getPreparedItems(),
					items_count: this.grid_event_collected_item_count.getItemCount(),
					l10n: this.l10n.collected_items_indicator,
					tooltip: {
						css_classes: BenefitHelper.getBenefitSkin(),
						x_value_prefix: true
					}
				}
			}));
		},

		hasRewardToCollect: function () {
			var reward = this.getPlayerGrid().getCurrentRewardToCollect();
			return typeof reward !== 'undefined' && reward !== null;
		},

		openRewardWindowIfRewardCanBeCollected: function () {
			if (!this.hasRewardToCollect()) {
				return;
			}

			var l10n = this.l10n.reward,
				title = this.getPlayerGrid().hasBlockedFigureType() ? l10n.sink_reward.title : l10n.grand_prize.title,
				controller = new RewardSubWindowController({
					window_controller: this,
					l10n: l10n,
					templates: {
						reward: this.getTemplate('reward')
					},
					models: {
						player_grid: this.getPlayerGrid()
					},
					cm_context: {
						main: this.getMainContext(),
						sub: 'sub_window_shop'
					}
				});

			this.openSubWindow({
				title: title,
				controller: controller,
				skin_class_names: 'classic_sub_window',
				closeable: false
			});
		},

		openGrandPrizeJourneySubWindow: function () {
			this.grand_prize_journey_controller = new GrandPrizeJourneySubWindowController({
				window_controller: this,
				l10n: this.l10n.grand_prize_journey,
				templates: {
					grand_prize_journey: this.getTemplate('grand_prize_journey')
				},
				models: {
					main_reward_progress_model: this.main_reward_progress_model
				},
				cm_context: {
					main: this.getMainContext(),
					sub: 'sub_window_grand_prize_journey'
				}
			});

			this.openSubWindow({
				title: this.l10n.grand_prize_journey.title,
				controller: this.grand_prize_journey_controller,
				skin_class_names: 'classic_sub_window sub_window_grand_prize_journey'
			});
		},

		getEventPowerTooltip: function (power_type) {
			var type = power_type.toLowerCase(),
				l10n = this.l10n[type];

			return '<b>' + l10n.title + '</b><br /><br />' + l10n.description;
		},

		getGrandPrizeRewards: function () {
			return this.main_reward_progress_model.getNextRewards();
		},

		getInventoryItemIds: function () {
			return this.getInventoryItemsCollection().getItemIds();
		},

		getInventoryItemProperties: function (item_id) {
			return this.getInventoryItemsCollection().getItemProperties(item_id);
		},

		useInventoryItem: function (event, reward_data) {
			this.showLoading();
			this.getInventoryItemsCollection().get(reward_data.id).useReward().then(this.hideLoading.bind(this));
		},

		stashInventoryItem: function (event, reward_data) {
			this.showLoading();
			this.getInventoryItemsCollection().get(reward_data.id).stashReward().then(this.hideLoading.bind(this));
		},

		trashInventoryItem: function (event, reward_data) {
			this.showLoading();
			this.getInventoryItemsCollection().get(reward_data.id).trashReward().then(this.hideLoading.bind(this));
		},

		getShardProgress: function () {
			return this.main_reward_progress_model.getShardProgress();
		},

		getCost: function () {
			return this.main_reward_progress_model.getCost();
		},

		getWindowSkin: function () {
			return BenefitHelper.getBenefitSkin();
		},

		spendShardsAndOpenGrandPrizeJourneySubWindow: function () {
			this.main_reward_progress_model.spendShards();
			this.openGrandPrizeJourneySubWindow();
		},

		getAvailableScouts: function () {
			return this.getPlayerGrid().getAvailableScouts();
		},

		getRewardQuantityMultiplier: function () {
			return this.getPlayerGrid().getRewardQuantityMultiplier();
		},

		reloadWindow: function () {
			this.closeWindow();
			GridEventWindowFactory.openWindow();
		},

		performReset: function () {
			this.is_reset = true;
			var callback = this.renderViewAfterReset.bind(this);
			this.getPlayerGrid().resetGrid(callback);
			this.view.fadeOutGridAndFigureRewards();
		},

		runTurnAnimation: function ($grid_cell) {
			var available_scouts = this.getAvailableScouts();
			this.runAnimation();
			var animation_without_backend_data_promise = this.view.startAnimationWithoutBackendData($grid_cell, available_scouts);
			var turn_on_change_promise = this.getPlayerGridTurns().onChange();
			Promise.all([animation_without_backend_data_promise, turn_on_change_promise])
				.then(this.prepareDataForAnimationWithBackendData.bind(this));
			this.completed_state_update_promise = this.createCompletedStateUpdatePromise();
		},

		createCompletedStateUpdatePromise: function () {
			return this.getCollection('player_grid_figure_rewards').onIsCompleteChange()
				.then(this.onCompleteFigureUpdate.bind(this) , function () {});
		},

		createFinalAnimationPromise: function () {
			this.completed_state_update_promise.then(this.prepareDataForFinalAnimation.bind(this));
		},

		runAnimation: function () {
			this.turn_animation_running = true;
			this.view.updateSpendShardsButton();
			this.getController('player_grid').updateResetGridButton();
		},

		onCompleteFigureUpdate: function (model) {
			return new Promise(function (resolve) {
				this.getController('figure_rewards').updateFigure(model);
				resolve(model);
			}.bind(this));
		},

		prepareDataForFinalAnimation: function (model) {
			if (model) {
				var indices = model.getFigurePlacement(),
					figure_type = model.getFigureType();
				this.getController('player_grid').updateCompletedFigure(indices, figure_type);
			}
		},

		prepareDataForAnimationWithBackendData: function (promises_data) {
			return new Promise(function (resolve, reject) {
				if (!this.checkIfAllPromisesAreResolved(promises_data)) {
					reject();
					return;
				}

				var model = this.getModelFromPromiseData(promises_data);

				if (model) {
					this.view.startAnimationWithBackendData(model, resolve);
				}
			}.bind(this));
		},

		getModelFromPromiseData: function (promises_data) {
			var data = promises_data.find(function (data) {
				return typeof data.model !== "undefined";
			});

			return data && data.model ? data.model : false;
		},

		checkIfAllPromisesAreResolved: function (promises_data) {
			var unresolved = promises_data.filter(function (data) {
				return !data || !data.resolved;
			});

			return unresolved.length === 0;
		},

		stopAnimation: function () {
			this.turn_animation_running = false;
			this.view.updateSpendShardsButton();
			this.getController('player_grid').updateResetGridButton();
		},

		isRewardMultiplierActive: function () {
			var grid_state = this.getPlayerGrid().getGridState();
			return this.getRewardQuantityMultiplier() > 1 && grid_state === GridState.TURN_AVAILABLE;
		},

		isScoutActive: function () {
			var grid_state = this.getPlayerGrid().getGridState();
			return this.getAvailableScouts() > 0 && grid_state === GridState.SCOUTING;
		},

		getTurnCost: function () {
			return this.getPlayerGrid().getTurnCost();
		},

		getGridResetCost: function () {
			return this.getPlayerGrid().getGridResetCost();
		},

		getTutorialOrder : function() {
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

			if (step === 'step_2') {
				result = result(this.getTurnCost());
			}

			return result;
		},

		getAdditionalTutorialTexts: function () {
			var l10n = this.getl10n();

			return {
				turn_cost: l10n.shot_costs(this.getTurnCost()),
				reset_cost: this.getGridResetCost(),
				progression_cost: this.getCost(),
				time_left: "00:37:12",
				sink_rewards: l10n.figure_rewards,
				daily_special: l10n.reward.daily_special.title,
				dropped_items: 10
			};
		},

		onOpenTutorialButtonClick: function () {
			TutorialHelper.showTutorial(this, TUTORIAL_PLAYER_HINT_KEY);
		},

		openRewardWindowIfGridStateHasBlockedFigureType: function () {
			if (this.getPlayerGrid().hasBlockedFigureType()) {
				this.openRewardWindowIfRewardCanBeCollected();
			}
		},

		destroy: function () {
			if (this.player_grid_controller) {
				this.player_grid_controller._destroy();
			}

			if (this.figure_rewards_controller) {
				this.figure_rewards_controller._destroy();
			}
		}
	});
});

