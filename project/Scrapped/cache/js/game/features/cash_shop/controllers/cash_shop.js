define('features/cash_shop/controllers/cash_shop', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var GameEvents = require('data/events');
	var View = require('features/cash_shop/views/cash_shop');

	return GameControllers.TabController.extend({

		initialize : function(options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		initializeView : function() {
			var args = this.getWindowModel().getArguments();

			this.view = new View({
				controller : this,
				el : this.$el,
				iframe_url : args.iframe_url
			});
			this.registerEventListeners();
		},

		registerEventListeners : function() {
			//GameEvents.premium.close_cash_shop - our custom event which is a reference to the CloseCashshop event defined by payment and
			//triggered on closing from the close buttons in the iframe
			$.Observer(GameEvents.premium.close_cash_shop).subscribe(['premium'], function() {
				this.closeWindow();
			}.bind(this));
		},

		renderPage : function() {
			this.initializeView();

			return this;
		}
	});
});
