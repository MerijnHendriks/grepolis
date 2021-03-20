/*global GameControllers */
(function() {
	'use strict';

	var GoldTradeInterstitialController = GameControllers.TabController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);

			this.setWindowTitle(this.getPreloadedWindowTitle());
		},

		initializeView : function() {
			this.view = new window.GameViews.GoldTradeInterstitialView({
				controller : this,
				el : this.$el
			});
		},

		getPreloadedL10n : function() {
			return this.getPreloadedData().l10n;
		},

		getPreloadedWindowTitle : function() {
			return this.getPreloadedL10n().window_title;
		},

		renderPage : function() {
			this.initializeView();

			return this;
		},

		/**
		 * Indicates if gold trading is unlocked or not.
		 * @returns {String} either 'locked' or 'unlocked'
		 */
		getGoldTradingState : function() {
			return this.getPreloadedData().state;
		},

		onButtonClick : function() {
			this.getPreloadedData().action.call(this);
		},

		destroy : function() {

		}
	});

	window.GameControllers.GoldTradeInterstitialController = GoldTradeInterstitialController;
}());
