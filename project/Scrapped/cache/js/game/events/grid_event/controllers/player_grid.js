/* globals Timestamp */

define('events/grid_event/controllers/player_grid', function () {
	'use strict';

	var BaseController = window.GameControllers.BaseController,
		PlayerGridView = require('events/grid_event/views/player_grid'),
		ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
		ConfirmationResetGrid = require('events/grid_event/dialogs/reset_grid'),
		BattleshipsData = require('events/grid_event/data/battleships'),
		GridState = require('events/grid_event/enums/grid_state');

	return BaseController.extend({
		view: null,

		initialize: function () {
			BaseController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.player_grid_turns = this.getPlayerGridTurnsCollection();

			this.view = new PlayerGridView({
				controller: this,
				el: this.$el
			});

			this.registerEventListeners();
		},

		registerEventListeners: function () {
			var player_ledger = this.parent_controller.getPlayerLedger(),
				player_grid = this.getPlayerGrid();

			this.stopListening();
			player_ledger.onGridCurrencyChange(this, this.handleGridCurrencyChange.bind(this));
			player_grid.onGridResetCostChange(this, this.view.updateResetGridButton.bind(this.view));
			player_grid.onGridStateChange(this, this.handleGridStateChange.bind(this));
			player_grid.onAdvancedScoutPowerCastedChanged(this, this.view.showAdvancedPowerIconAndRegisterTooltip.bind(this.view));
			player_grid.onRewardQuantityMultiplierChange(this, this.view.updatePlayerGridGlow.bind(this.view));
			player_grid.onAvailableScoutsChange(this, this.view.updatePlayerGridGlow.bind(this.view));
		},

		getPlayerGrid: function () {
			return this.getModel('player_grid');
		},

		getPlayerGridTurnsCollection: function () {
			return this.getCollection('player_grid_turns');
		},

		getFigureRewardsCollection: function () {
			return this.getCollection('player_grid_figure_rewards');
		},

		getFigureRewards: function () {
			return this.getFigureRewardsCollection().getFigureRewards();
		},

		getUncoveredGridIndeces: function () {
			return this.player_grid_turns.getUncoveredGridIndeces();
		},

		getResetTime: function () {
			return this.getPlayerGrid().getResetTime();
		},

		getTimeLeftUntilReset: function () {
			return this.getResetTime() - Timestamp.now();
		},

		getGridCurrency: function () {
			return this.parent_controller.getGridCurrency();
		},

		getGridResetCosts: function () {
			return this.getPlayerGrid().getGridResetCost();
		},

		getTurnCost: function() {
			return this.getPlayerGrid().getTurnCost();
		},

		getGridWidth: function () {
		 	return this.getPlayerGrid().getGridWidth();
		},

		getGridHeight: function () {
			return this.getPlayerGrid().getGridHeight();
		},

		getCompletedFigurePlacements: function () {
			return this.getFigureRewardsCollection().getFigurePlacements();
		},

		showLoading: function () {
			this.parent_controller.showLoading();
		},

		hideLoading: function () {
			this.parent_controller.hideLoading();
		},

		updateResetGridButton: function () {
			this.view.updateResetGridButton();
		},

		updateCompletedFigure: function (indices, figure_type) {
			this.view.fadeOutResultAndShowCompletedFigure(indices, figure_type);
		},

		onButtonResetGridClick: function () {
			ConfirmationWindowFactory.openConfirmationWindow(
				new ConfirmationResetGrid({
					onConfirm: this.parent_controller.performReset.bind(this.parent_controller)
				})
			);
		},

		onPlayerGridClick: function ($el) {
			var grid_index = $el.data('grid_index'),
				is_completed = $el.hasClass('completed'),
				collection = this.getPlayerGridTurnsCollection();

			if (is_completed || this.parent_controller.turn_animation_running ||
				this.parent_controller.reward_animation_running) {
				return;
			}

			this.parent_controller.runTurnAnimation($el);
			collection.takeTurn(grid_index);
		},

		getPlayerGridTurn: function (grid_index) {
			return this.player_grid_turns.getPlayerGridTurnByGridIndex(grid_index);
		},

		getRewardByGridIndex: function (grid_index) {
			return this.getPlayerGridTurn(grid_index).getReward();
		},

		getFigureOrientation: function (figure_type) {
			var figure_reward = this.getFigureRewardsCollection().getFigureReward(figure_type);
			return figure_reward ? figure_reward.getFigureOrientation() : '';
		},

		getUncoveredType: function (grid_index) {
			return this.getPlayerGridTurn(grid_index).getUncoveredOnly();
		},

		getInteractionResult: function (grid_index) {
			var player_grid_turn = this.getPlayerGridTurn(grid_index);
			return player_grid_turn.getInteractionResult();
		},

		getGridState: function () {
			return this.getPlayerGrid().getGridState();
		},

		getRewardQuantityMultiplier: function() {
			return this.getPlayerGrid().getRewardQuantityMultiplier();
		},

		getEventPowerTooltip: function (power_type) {
			return this.parent_controller.getEventPowerTooltip(power_type);
		},

		getPlayerLedger: function () {
			return this.getModel('player_ledger');
		},

		getWindowSkin: function () {
			return this.parent_controller.getWindowSkin();
		},

		canTakeTurn: function () {
			return this.getPlayerLedger().getGridCurrency() >= this.getTurnCost();
		},

		isAdvancedScoutsPowerCasted: function () {
			var player_grid = this.getPlayerGrid();
			return player_grid.getAdvancedScoutsPowerCasted();
		},

		getAdvancedScoutPowerConfiguration: function () {
			var player_grid = this.getPlayerGrid();
			return player_grid.getAdvancedScoutPowerConfiguration();
		},

		handlePlayerGridTurnChange: function (model, resolve) {
			this.view.updatePlayerGridCell(model.getGridIndex(), true, resolve);
			this.view.setUnopenedPlayerGridSpotTooltips();
		},

		handleGridStateChange: function () {
			if (this.parent_controller.turn_animation_running) {
				return;
			}
			this.view.updatePlayerGridState();
			this.view.updatePlayerGridGlow();
			this.view.setUnopenedPlayerGridSpotTooltips();
		},

		onRewardsListButtonClick: function () {
			this.parent_controller.openRewardsListSubWindow();
		},

		reloadWindow: function () {
			this.parent_controller.reloadWindow();
		},

		getCellToolipIndex: function() {
			var grid_state = this.getGridState(),
				can_take_turn = this.canTakeTurn(),
				reward_quantity_multiplier = this.getRewardQuantityMultiplier();

			return BattleshipsData.getTooltipTranslationIndex(grid_state, can_take_turn, reward_quantity_multiplier);
		},

		isSpecialRewardActive: function () {
			return this.parent_controller.isScoutActive() ||
				this.parent_controller.isRewardMultiplierActive();
		},

		isGridBlocked: function () {
			var state = this.getGridState();

			return state === GridState.BLOCKED_REWARD ||
				state === GridState.BLOCKED_INVENTORY ||
				state === GridState.RESET_NEEDED;
		},

		handleGridCurrencyChange: function () {
			this.view.updateResetGridButton();
			this.view.updatePlayerGridCanTakeTurn();
		},

		canTakeTurnOrScout: function (is_uncovered_grid_cell) {
			var can_take_turn = this.canTakeTurn(),
				state = this.getGridState();

			return (can_take_turn && state === GridState.TURN_AVAILABLE) ||
				(state === GridState.SCOUTING && !is_uncovered_grid_cell);
		},

		automaticallyReset: function () {
			if (this.parent_controller.turn_animation_running) {
				this.unregisterTimer('grid_event_auto_reset');
				this.registerTimer('grid_event_auto_reset', 500, function () {
					this.automaticallyReset();
				}.bind(this), {max : 1});
				return;
			}
			this.reloadWindow();
		}
	});
});
