/* global Game, GameDataPowers, GameViews */
(function() {
	'use strict';

	var TabController = window.GameControllers.TabController;
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
	var ResourceRewardDataFactory = require('factories/resource_reward_data_factory');

	var ValentinesDayCollectController = TabController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			TabController.prototype.initialize.apply(this, arguments);
		},

		//Data from the server is given though 'data' argument
		renderPage : function(data) {
			this.view = new GameViews.ValentinesDayCollectView({
				el : this.$el,
				controller : this
			});

			this.getReward();

			return this;
		},

		getMermaidModel : function() {
			return this.getPreloadedData().preloaded_data.models.mermaid;
		},

		_getIconClassName : function() {
			return 'power_icon60x60 ' + GameDataPowers.getRewardCssClassIdWithLevel(this.getReward());
		},

		getReward : function() {
			return this.getMermaidModel().getReward();
		},

		handleCastingSpell : function() {
			this.castSpell();
		},

		castSpell : function() {
			var reward = new window.GameModels.RewardItem(this.getReward());
			ConfirmationWindowFactory.openConfirmationWastedResources(function() {
				reward.use({}, 'mermaid');
				this.closeWindow();
			}.bind(this), function() {}, ResourceRewardDataFactory.fromCastedPowersModel(reward), Game.townId);
		},

		destroy : function() {

		}
	});

	window.GameControllers.ValentinesDayCollectController = ValentinesDayCollectController;
}());
