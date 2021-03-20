define('events/grid_event/controllers/progression_movement', function () {
	'use strict';

	var BaseController = window.GameControllers.BaseController,
		GameEvents = require('data/events'),
		BenefitHelper = require('helpers/benefit'),
		ProgressionMovementView = require('events/grid_event/views/progression_movement');

	return BaseController.extend({
		view: null,

		movement_coordinates: [],
		max_steps_per_move: 3,

		initialize: function () {
			BaseController.prototype.initialize.apply(this, arguments);
			this.main_reward_progress_model = this.parent_controller.main_reward_progress_model;
			this.player_grid_model = this.parent_controller.getPlayerGrid();
			this.current_position = this.main_reward_progress_model.getShardProgress();
			this.getMovementCoordinatesForCurrentSkin();
		},

		renderPage: function () {
			this.view = new ProgressionMovementView({
				controller: this,
				el: this.$el
			});

			this.registerEventListeners();
		},

		registerEventListeners: function () {
			this.stopListening();
			this.stopObservingEvent(GameEvents.grid_event.close_grand_prize_journey);
			this.observeEvent(GameEvents.grid_event.close_grand_prize_journey, this.onGrandPrizeJourneyWindowClose.bind(this));
			this.main_reward_progress_model.onShardProgressChange(this, this.onShardProgressChange.bind(this));
			this.player_grid_model.onCurrentRewardToCollectChange(this, this.onCurrentRewardToCollectChange.bind(this));
		},

		getCurrentPositionData: function () {
			return this.movement_coordinates[this.current_position];
		},

		getMaxPosition: function () {
			return this.movement_coordinates.length - 1;
		},

		getShardProgress: function () {
			return this.main_reward_progress_model.getShardProgress();
		},

		shouldProgressMovementItemBeMoved: function () {
			return this.getShardProgress() !== this.current_position;
		},

		onGrandPrizeJourneyWindowClose: function () {
			this.onShardProgressChange();
			this.onCurrentRewardToCollectChange();
		},

		onShardProgressChange: function () {
			if (!$('.sub_window_grand_prize_journey').length && this.shouldProgressMovementItemBeMoved()) {
				this.moveProgressionItemOneStep();
			}
		},

		onCurrentRewardToCollectChange: function () {
			if (!$('.sub_window_grand_prize_journey').length &&
				!this.player_grid_model.hasBlockedFigureType()) {
				this.parent_controller.openRewardWindowIfRewardCanBeCollected();
			}
		},

		moveProgressionItemOneStep: function () {
			if (!this.view) {
				return;
			}
			/*
			 * when the current position is at the end point set it to 0 so it can go from the beginning again
			 */
			if (this.current_position >= this.getMaxPosition()) {
				this.current_position = 0;
				this.view.showAndPlaceMovementItemOnGivenPosition(this.getCurrentPositionData(), this.current_position);
			// when the final position is not yet reached
			} else if (this.shouldProgressMovementItemBeMoved()) {
				this.current_position += 1;
				this.view.moveProgressItem(this.getCurrentPositionData(), this.current_position);
			}
		},

		getMovementCoordinatesForCurrentSkin: function () {
			var skin = BenefitHelper.getBenefitSkin();
			var movement_data_helper = require('events/grid_event/helpers/progression_movement_data/' + skin);
			if (movement_data_helper) {
				this.movement_coordinates = movement_data_helper.movement_coordinates;
				return;
			}
			throw 'Please create a movement data helper to get the coordinates for the skin';
		}
	});
});