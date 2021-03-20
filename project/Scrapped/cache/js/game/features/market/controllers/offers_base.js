/*global define,GameData, Game, MM */

define('market/controllers/offers_base', function() {
	'use strict';

	var controllers = window.GameControllers;
	var GameEvents = window.GameEvents;
	var MarketOffersCollection = window.GameCollections.MarketOffers;
	var MarketOfferDetailsController = require('market/controllers/offer_details');
	var MarketHelper = require('market/helper/market');
	var GameDataFeatureFlags = require('data/features');
	var MAX_PAGE_SIZE = 12;

	return controllers.TabController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			controllers.TabController.prototype.initialize.apply(this, arguments);

			this.updateWindowTitle();

			this.offers_collection = new MarketOffersCollection([], {
				state: {
					pageSize: MAX_PAGE_SIZE,
					firstPage: 0
				}
			});
			this.offers_collection.setAction(options.offersApiAction);
			this.offers_collection.registerExtraParamFunc(this.getFilters.bind(this));

			this.observeEvent(GameEvents.window.tab.rendered, function(data, window_data) {
				if (window_data.window_model.attributes.window_type !== "market") {
					return;
				}
				var jqXHR = this.offers_collection.getFirstPage();
				this.getWindowModel().showLoading();

				jqXHR.done(function() {
					this.reRender();
				}.bind(this));
			}.bind(this));

			this.observeEvent(GameEvents.town.town_switch, function() {
				this.fetchPage(0);
				this.updateWindowTitle();
                MarketHelper.showMarketTabs(this);
			}.bind(this));

			// reset saves filters if window closes
			this.setOnManualClose(function() {
				window.GameDataMarket.resetFilters();
			});
		},

		sortBy: function(value, order, done) {
			this.filters.order_by = value;
			this.filters.order_direction = order;
			this.fetchPage(this.offers_collection.state.currentPage, function() {
				this.reRender();
			}.bind(this));
		},

		updateWindowTitle : function() {
			this.setWindowTitle(GameData.buildings.market.name + ' (' + Game.townName + ')');
		},

		renderPage : function(data) {
			return false;
		},

		reRender: function() {
			this.getWindowModel().hideLoading();
			this.initializeView();
		},

		/**
		 * Fetches the requested page and calls reRender afterwards
		 * @param {integer} page_nr
		 * @param {function} cb - callback when offers successfully loaded
		 */
		fetchPage: function(page_nr, cb) {
			cb = cb || this.reRender.bind(this);
			this.getWindowModel().showLoading();
			this.offers_collection.getPage(page_nr).done(cb);
		},

		getOffersCollection: function() {
			return this.offers_collection;
		},

		getMaxCapacity : function() {
			var market_data = this.offers_collection.getMarketData();
			return market_data.max_capacity;
		},

		getAvailableCapacity : function() {
			var current_town = this.getCollection('towns').getCurrentTown();

			return current_town.getAvailableTradeCapacity();
		},

		/**
		 * Defines the shown filters
		 * @returns {string[]}
		 */
		getFilterResources : function() {
			if (this.isPremiumExchangeEnabled()) {
				return ['all', 'all_but_gold', 'gold', 'wood', 'stone', 'iron'];
			} else {
				return ['all_but_gold', 'wood', 'stone', 'iron'];
			}
		},

		isPremiumExchangeEnabled : function() {
			var market_level = MM.getCollections().Town[0].getCurrentTown().getBuildings().getBuildingLevel('market');

			return GameDataFeatureFlags.isPremiumExchangeEnabled() && market_level >= Game.constants.market.needed_market_level_for_premium_exchange;
		},

		openOfferDetails: function(offer) {
			var controller = new MarketOfferDetailsController({
				l10n : this.getl10n(),
				window_controller : this,
				templates : {
					offer_details: this.getTemplate('offer_details')
				},
				models : {
					offer: offer
				},
				cm_context : {
					main : this.getMainContext(),
					sub : 'offer_details'
				}
			});

			this.openSubWindow({
				title : this.l10n.trade_details,
				controller : controller,
				skin_class_names : 'classic_sub_window'
			});
		},

		hasMarket: function() {
			return MarketHelper.hasMarket();
		},

		getOfferById: function(id) {
			return this.offers_collection.get(id);
		},

		getSortKey : function() {
			return this.filters.order_by;
		},

		getSortOrder : function() {
			return this.filters.order_direction;
		},

		getMaxPageSize: function () {
			return MAX_PAGE_SIZE;
		},

		destroy : function() {

		}
	});
});
