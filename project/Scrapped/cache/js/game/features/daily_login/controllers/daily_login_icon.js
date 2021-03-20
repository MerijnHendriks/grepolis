define('features/daily_login/controllers/daily_login_icon', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/daily_login/views/daily_login_icon');
	var DailyLoginWindowFactory = require('features/daily_login/factories/daily_login');

	return GameControllers.BaseController.extend({

		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.initializeView();
		},

		registerEventListeners : function() {
			this.getModel('daily_login').onRewardsChange(this, this.renderPage);
		},

		renderPage: function() {
			if(this.isBonusAvailable()) {
				this.$el.show();
			} else {
				this.$el.hide();
			}
		},

		initializeView : function() {
			this.view = new View({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		isBonusAvailable : function() {
			return this.getModel('daily_login').getAcceptedAt() === null;
		},

		openWindow : function() {
			DailyLoginWindowFactory.openWindow();
		}

	});
});
