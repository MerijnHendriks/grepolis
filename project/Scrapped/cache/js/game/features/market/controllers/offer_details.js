/*global define */

define('market/controllers/offer_details', function() {
	'use strict';

	var controllers = window.GameControllers;
	var MarketOfferDetailsView = require('market/views/offer_details');

	return controllers.BaseController.extend({
		view : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			controllers.BaseController.prototype.initialize.apply(this, arguments);
			this.parent_controller = options.window_controller;
		},

		render : function($el) {
			this.view = new MarketOfferDetailsView({
				controller : this,
				el : $el
			});
		},

		closeAndRefreshOffers : function(data) {
			if (data.available_capacity) {
				this.parent_controller.updateCapacityBar(data.available_capacity);
			}
			this.close();
			this.parent_controller.refreshOffers();
		},

		trade: function(amount) {
			this.getModel('offer').trade(amount).then(this.closeAndRefreshOffers.bind(this));
		},

		/**
		 * closes this sub-window
		 */
		close: function() {
			this.parent_controller.closeSubWindow();
		},

		destroy : function() {

		}
	});
});
