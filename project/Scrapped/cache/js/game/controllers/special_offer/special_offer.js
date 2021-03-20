/* globals GameControllers, DM */
(function() {
	'use strict';

	window.GameControllers.SpecialOfferController = GameControllers.TabController.extend({
		view : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
			this.interstitial_model = options.window_model.preloaded_data.interstitial_model;

			this.registerEventListeners();
		},

		initializeView : function() {
			this.view = new window.GameViews.SpecialOfferView({
				controller : this,
				el : this.$el
			});
		},

		registerEventListeners : function() {
			// when the window get closed manually, trigger the reject action on the
			// interstitial. The model decides if something happens.
			this.setOnManualClose(this.triggerCancelAction.bind(this));

			// close window when server removes the model
			var collection = this.interstitial_model.collection;

			collection.onRemove(this, function() {
				this.closeWindow();
			}.bind(this));
		},

		renderPage : function() {
			this.initializeView();
			return this;
		},

		getOfferl10n : function() {
			return DM.getl10n(this.interstitial_model.getl10nType());
		},

		getDiscountType : function() {
			return this.interstitial_model.getDiscountType();
		},

		getDiscountValue : function() {
			return this.interstitial_model.getBonus();
		},

		getDiscountString : function() {
			return this.interstitial_model.getDiscountString();
		},

		getTimerEndTime : function() {
			return this.interstitial_model.getTimer();
		},

		hasTimer : function() {
			return this.interstitial_model.hasTimer();
		},

		getCssTheme : function() {
			return this.interstitial_model.getCssTheme();
		},

		onWindowClicked : function() {
			this.triggerAcceptAction();
			this.closeWindow();
		},

		triggerAcceptAction : function() {
			this.interstitial_model.accept();
		},

		triggerCancelAction : function() {
			this.interstitial_model.reject();
		},

		destroy : function() {

		}
	});
}());
