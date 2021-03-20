/* globals GameEvents */

define('events/grid_event/controllers/sub-windows/reward', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		RewardSubWindowView = require('events/grid_event/views/sub-windows/reward');

	return SubWindowController.extend({
		view: null,
		is_sink_reward: false,

		initialize: function (options) {
			SubWindowController.prototype.initialize.apply(this, arguments);
			this.setOnAfterClose(function() {
				if (this.is_sink_reward) {
					this.window_controller.createFinalAnimationPromise();
				}
			}.bind(this));
		},

		render: function ($el) {
			this.$el = $el;
			this.is_sink_reward = this.hasBlockedFigureType();
			this.initializeView();
			this.registerEventListeners();
		},

		initializeView: function () {
			this.view = new RewardSubWindowView({
				controller: this,
				el: this.$el
			});
		},

		registerEventListeners: function () {
			this.stopObservingEvents();
			this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.trash, this.trashReward.bind(this));
		},

		getPlayerGrid: function () {
			return this.getModel('player_grid');
		},

		getReward: function () {
			return this.getPlayerGrid().getCurrentRewardToCollect();
		},

		hasBlockedFigureType: function () {
			return this.getPlayerGrid().hasBlockedFigureType();
		},

		getBlockedFigureType: function () {
			return this.getPlayerGrid().getBlockedFigureType();
		},

		useReward: function () {
			this.getPlayerGrid().useReward(this.close.bind(this));
		},

		stashReward: function () {
			this.getPlayerGrid().stashReward(this.close.bind(this));
		},

		trashReward: function () {
			this.getPlayerGrid().trashReward(this.close.bind(this));
		},

		destroy: function () {
			$('#context_menu').empty();
		}
	});
});