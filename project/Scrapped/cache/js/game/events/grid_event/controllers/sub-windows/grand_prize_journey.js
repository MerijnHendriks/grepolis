define('events/grid_event/controllers/sub-windows/grand_prize_journey', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		GameEvents = require('data/events'),
		GrandPrizeJourneySubWindowView = require('events/grid_event/views/sub-windows/grand_prize_journey');

	return SubWindowController.extend({
		view: null,
		rotation_css_classes: {
			1: 'onestep',
			2: 'twosteps',
			3: 'threesteps'
		},
		rotation_speed: {
			1: 240,
			2: 1200,
			3: 720
		},
		rotation_position: 0,

		initialize: function () {
			SubWindowController.prototype.initialize.apply(this, arguments);
			this.main_reward_progress_model = this.getModel('main_reward_progress_model');
			this.setOnAfterClose(function() {
				this.publishEvent(GameEvents.grid_event.close_grand_prize_journey, {});
			}.bind(this));
		},

		render: function ($el) {
			this.unregisterTimer('grand_prize_journey_auto_close');
			this.$el = $el;
			this.initializeView();
			this.registerEventListener();
		},

		initializeView: function () {
			this.view = new GrandPrizeJourneySubWindowView({
				controller: this,
				el: this.$el
			});
		},

		registerEventListener: function () {
			this.stopListening();
			this.main_reward_progress_model.onShardProgressChange(this, this.onShardProgressChange.bind(this));
		},

		onShardProgressChange: function() {
			this.rotation_position = this.main_reward_progress_model.getLastNumberOfProgressSteps();
		},

		getRotationCssClass: function () {
			return this.rotation_position ? this.rotation_css_classes[this.rotation_position] : 0;
		},

		getWindowSkin: function () {
			return this.parent_controller.getWindowSkin();
		},

		resetRotationPosition: function () {
			this.rotation_position = 0;
		},

		registerAutoCloseTimer: function () {
			this.unregisterTimer('grand_prize_journey_auto_close');
			this.registerTimer('grand_prize_journey_auto_close', 2000, this.closeMe.bind(this), {max : 1});
		},

		closeMe: function () {
			this.close();
		},

		destroy: function () {

		}
	});
});