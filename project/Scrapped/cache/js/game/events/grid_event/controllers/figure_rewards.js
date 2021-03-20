define('events/grid_event/controllers/figure_rewards', function () {
	'use strict';

	var BaseController = window.GameControllers.BaseController,
		FigureRewardsView = require('events/grid_event/views/figure_rewards');

	return BaseController.extend({
		view: null,

		initialize: function () {
			BaseController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.view = new FigureRewardsView({
				controller: this,
				el: this.$el
			});

			this.registerEventListeners();
		},

		registerEventListeners: function () {
			var figure_rewards = this.getFigureRewardsCollection();

			this.stopListening();
			figure_rewards.onNumberOfHitsChange(this, this.updateFigure.bind(this));
		},

		getFigureRewardsCollection: function () {
			return this.getCollection('player_grid_figure_rewards');
		},

		getFigureTypes: function () {
			return this.getFigureRewardsCollection().getFigureTypes();
		},

		getFigureReward: function (figure_type) {
			return this.getFigureRewardsCollection().getFigureReward(figure_type);
		},

		getFigureHeight: function (figure_type) {
			return this.getFigureReward(figure_type).getFigureHeight();
		},

		getFigureWidth: function (figure_type) {
			return this.getFigureReward(figure_type).getFigureWidth();
		},

		getNumberOfHits: function (figure_type) {
			return this.getFigureReward(figure_type).getNumberOfHits();
		},

		getRewardData: function (figure_type) {
			return this.getFigureReward(figure_type).getReward();
		},

		isComplete: function (figure_type) {
			return this.getFigureReward(figure_type).getIsComplete();
		},

		updateFigure: function (model) {
			this.view.updateFigure(model.getFigureType());
		}
	});
});