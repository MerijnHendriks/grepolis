/*global define */

define('market/controllers/all_offers', function() {
	'use strict';

	var OffersBaseController = require('market/controllers/offers_base');
	var MarketAllOffersView = require('market/views/all_offers');
	var MarketHelper = require('market/helper/market');
	var OrderType = require('market/enums/order_type');
    var BuyForGoldWindowFactory = require('no_gold_dialog/factories/buy_for_gold');
	var TYPE_GOLD = 'gold';

	return OffersBaseController.extend({
		view : null,

		initialize : function(options) {
			//Calls initializeView after fetching the first page of offers
			$.extend(options, {
				offersApiAction: 'getData'
			});
			OffersBaseController.prototype.initialize.apply(this, arguments);
			this.filters = window.GameDataMarket.getCurrentFilters() || this.getDefaultFilters();
		},

		initializeView : function() {
			this.view = new MarketAllOffersView({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		registerEventListeners : function() {
			var current_town = this.getCollection('towns').getCurrentTown();
			this.stopListening();
			current_town.onAvailableTradeCapacityChange(this, function() {
				this.updateCapacityBar(this.getAvailableCapacity());
			}.bind(this));
		},

		/*
		 * get the current set of filters for the API
		 */
		getFilters : function() {
			return this.filters;
		},

		/**
		 * reset filter internal state and UI representation to default values
		 */
		resetFilters : function() {
			this.filters = this.getDefaultFilters();
			window.GameDataMarket.setCurrentFilters(this.filters);
			this.view.setFilters(this.filters);
			this.view.table_sorter.reset();
			this.onFiltersChanged();
		},

		/**
		 * called when filters are changed to update the bookkeeping and resync,
		 * also update the UI
		 */
		onFiltersChanged : function() {
			var offers_collection = this.getOffersCollection();
			this.filters = this.view.getFilters();
			window.GameDataMarket.setCurrentFilters(this.filters);
			this.getWindowModel().showLoading();

			var jqXHR = offers_collection.getFirstPage();
			if (jqXHR) {
				jqXHR.done(function() {
					// view could already be disposed
					if(this.view) {
						this.view.renderOffers();
					}
					this.getWindowModel().hideLoading();
				}.bind(this));
			}
		},

		/**
		 * get sane default values for the filters
		 * @returns {Object}
		 */
		getDefaultFilters : function() {
			// resources = all_plus_gold or all (if no gold trading)
			// ratio =  3:1
			// duration = max (99:99:99) or (48:00:00)
			var default_resources = this.getFilterResources()[0];
			return {
				demand_type: default_resources, //get
				offer_type: default_resources, // pay
				max_ratio: 3,
				max_delivery_time: 172800,  //duration
				visibility : 2,
				order_by: 'ratio',
				order_direction : 'desc'
			};
		},

		// reload current page when detail window gets closed
		refreshOffers : function() {
			this.getOffersCollection().fetch({
				success: this.view.renderOffers.bind(this.view)
			});
		},

		updateCapacityBar : function(amount) {
			 this.view.updateCapacityBar(amount);
		},

		handleQuickTrade: function (offer) {
			var	trade = function() {
				offer.trade().then(this.refreshOffers.bind(this));
			}.bind(this);

			if (offer.getDemandType() === TYPE_GOLD) {
				BuyForGoldWindowFactory.openAcceptGoldTradeForGoldWindow(
					this.btn_trade,
					offer.getDemand(),
					trade
				);
			} else {
				trade();
			}
		},

		createPremiumExchangeOrder: function (offer) {
			var result;

			if (offer.getDemandType() === TYPE_GOLD) {
				result = {
					type: OrderType.BUY,
					gold: offer.getDemand(),
					resource_type: offer.getOfferType(),
					resource_amount: offer.getOffer()
				};
			} else {
				result = {
					type: OrderType.SELL,
					gold: offer.getOffer(),
					resource_type: offer.getDemandType(),
					resource_amount: offer.getDemand()
				};
			}

			return result;
		},

		requestPremiumExchangeOffer: function (offer) {
			var order = this.createPremiumExchangeOrder(offer);

            MarketHelper.requestPremiumExchangeOffer(order, function (data) {
				var sub_window = MarketHelper.openWindowConfirmOrder(this, order, data, this.getModels());
				sub_window.setOnAfterClose(this.refreshOffers.bind(this));
			}.bind(this));
		},

		destroy : function() {
		}
	});
});
