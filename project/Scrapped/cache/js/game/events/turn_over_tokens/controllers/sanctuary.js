/* global us */
define('events/turn_over_tokens/controllers/sanctuary', function(require) {

    'use strict';

    var AssassinsSanctuaryController;
	var GameControllers = window.GameControllers;
	var RewardItem = window.GameModels.RewardItem;
    var AssassinsSanctuaryView = require('events/turn_over_tokens/views/sanctuary');

	var AssassinsFightController = require('events/turn_over_tokens/controllers/fight');
	var Tutorial = require('events/turn_over_tokens/helper/tutorial');


	AssassinsSanctuaryController = GameControllers.TabController.extend({
		view: null,
		meta_data_model: null,

		initialize: function (options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.meta_data_model = this.getModel('assassins_player_meta_data');
			this.player_hints = this.getCollection('player_hints');
			AssassinsFightController.prototype.setInactivePreviousCompleteCollection.call(this);
			this.initializeView();
			AssassinsFightController.prototype.showTutorial.call(this, Tutorial.steps.STEP7);
			return this;
		},

		initializeView: function () {
			this.view = new AssassinsSanctuaryView({
				controller: this,
				el: this.$el
			});
		},

		/**
		 * Returns the number of collected trophies for all units
		 * @return {object} - { <unit>: number }
		 */
		getTrophies: function() {
			return this.meta_data_model.getTrophies();
		},

		/**
		 * Returns true if all trophies for a given unit have been collected.
		 * @param name - unit
		 * @return {boolean}
		 */
		isCollectionComplete: function(name) {
			return this.getTrophies()[name] === 10;
		},

		isRewardCollected: function(unit) {
			return this.getRewards()[unit].is_collected;
		},

		/**
		 * Puts the reward for completing a collection to the inventory and reRenders the view
		 * @param {string} collection_type
		 */
		collectItems: function(collection_type) {
			var reward_data = this.getRewards()[collection_type],
				reward = reward_data.reward,
				toInventory = this.view.animateRewardToInventory.bind(this.view, collection_type),
				reRender = this.view.reRender.bind(this.view);

			reward.stash(us.compose(reRender, toInventory), 'assassins');
		},

		/**
		 * RewardItems and the amount of each reward
		 * @return {Object} - { <unit> : { reward: RewardItem, amount: number } }
		 */
		getRewards: function() {
			return us.objMap(this.meta_data_model.getCollectionRewards(), function(reward) {
				return {
					amount: reward.amount,
					collected: reward.is_collected,
					reward: new RewardItem(reward.reward),
					reward_chance: reward.reward_chance
				};
			});
		},

		/**
		 * Award IDs
		 * @return {string[]}
		 */
		getAwards: function() {
			return this.meta_data_model.getCollectionAwards();
		},

		destroy: function () {

		}
	});

    return AssassinsSanctuaryController;
});
