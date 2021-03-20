define('features/attack_spots/controllers/victory', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var GameEvents = require('data/events');
	var View = require('features/attack_spots/views/victory');

	return GameControllers.TabController.extend({

		initialize : function(options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners : function() {
			this.observeEvent(GameEvents.attack_spot.reward.use, this._rewardAction.bind(this, 'use'));
			this.observeEvent(GameEvents.attack_spot.reward.stash, this._rewardAction.bind(this, 'stash'));
			this.observeEvent(GameEvents.attack_spot.reward.trash, this._rewardAction.bind(this, 'trash'));
		},

		renderPage: function() {
			this.initializeView();
		},

		initializeView : function() {
			this.view = new View({
				controller : this,

				el : this.$el
			});
			this.registerEventListeners();
		},

		getReward: function() {
			return this.getModel('player_attack_spot').getReward();
		},

		_rewardAction : function(action) {
			var model = this.getModel('player_attack_spot');

			model[action]({
				success: function() {
					this.closeWindow();
				}.bind(this)
			});
		}
	});
});

