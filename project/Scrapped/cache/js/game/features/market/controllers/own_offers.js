/*global define, us */

define('market/controllers/own_offers', function() {
	'use strict';

	var MarketOwnOffersView = require('market/views/own_offers');
	var OffersBaseController = require('market/controllers/offers_base');
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');

	return OffersBaseController.extend({
		view : null,
		filtered_town: 'all',
		filters: {},

		initialize : function(options) {
			//Calls initializeView after fetching the first page of offers
			$.extend(options, {
				offersApiAction: 'getOwnOffers'
			});
			OffersBaseController.prototype.initialize.apply(this, arguments);
			this.filters = {
				order_by: 'created_at',
				order_direction: 'desc'
			};
		},

		initializeView : function() {
			this.view = new MarketOwnOffersView({
				controller : this,
				el : this.$el
			});
		},

		getCurrentTownFilter: function () {
			return this.filtered_town;
		},

		filterByTownId: function(id) {
			this.filtered_town = id;
			this.fetchPage(0, function() {
				this.view.renderOffers();
				this.unregisterComponent('pagination');
				this.view._registerPagination();
				this.getWindowModel().hideLoading();
			}.bind(this));
		},

		reRenderTable: function(page) {
			this.fetchPage(page || 0, function() {
				if(this.view) {
					this.view.renderOffers();
				}
				this.getWindowModel().hideLoading();
			}.bind(this));
		},

		goToPreviousPage: function() {
			var previous_page = Math.max(this.offers_collection.state.currentPage - 1, 0);
			this.reRenderTable(previous_page);
		},

		_getRequestParamObject: function(offers) {
			var offer_ids = offers.map(function(offer) {
				return offer.getId();
			});
			return {
                model_url : 'BuildingMarket',
                action_name : 'deleteOffers',
                'arguments': {
                    offer_ids: offer_ids
                }
            };
		},

		_getSuccessRemovalCallback: function(offers, callback) {
            if (callback) {
                callback();
            }

            if (offers.length > 1) {
				this.offers_collection.reset();
            } else {
                this.offers_collection.remove(offers);
            }

            if ( this.offers_collection.length === 0) {
                this.goToPreviousPage();
            }
		},

		/**
		 * Sends a request to delete an offer
		 * @param {} offer
		 * @param {function} callback
		 */
		deleteOffer: function(offer, callback) {
            ConfirmationWindowFactory.openConfirmationWastedResources(function() {
                var index_params = this._getRequestParamObject([offer]),
					wrapped_callback = this._getSuccessRemovalCallback.bind(this, [offer], callback);

                window.gpAjax.ajaxPost('frontend_bridge', 'execute', index_params, false, wrapped_callback);
           	}.bind(this), null, {
                'wood' : offer.getOfferType() === 'wood' ? offer.getOffer() : 0,
                'stone' : offer.getOfferType() === 'stone' ? offer.getOffer() : 0,
                'iron' : offer.getOfferType() === 'iron' ? offer.getOffer() : 0
            }, offer.getTownId());
		},

        deleteAllMarketOffers: function() {
            var town_reward_data = {};

            this.offers_collection.models.forEach(function (offer) {
                var town_id = offer.getTownId(),
					offer_type = offer.getOfferType(),
					reward_data = town_reward_data[town_id] || {
                		wood: 0,
						stone: 0,
						iron: 0
					};

                reward_data[offer_type] += offer.getOffer();
                town_reward_data[town_id] = reward_data;
			});

            ConfirmationWindowFactory.openConfirmationWastedResourcesMultiple(function () {
                var index_params = this._getRequestParamObject(this.offers_collection),
					wrapped_callback = this._getSuccessRemovalCallback.bind(this, this.offers_collection, false);

                window.gpAjax.ajaxPost('frontend_bridge', 'execute', index_params, false, wrapped_callback);
            }.bind(this), null, town_reward_data);
		},

		/*
		 * get the current set of filters for the API
		 */
		getFilters : function() {
			var town_filter = this.filtered_town === 'all' ? {
					all_towns: true
				} :
				{
					town_filter: this.filtered_town
				};

			return us.extend({}, this.filters, town_filter);
		},

		// reload current page when detail window gets closed
		refreshOffers : function() {
			this.reRenderTable();
		},

		// stub, called from trade details tab. Does nothing here
		updateCapacityBar : function() {
			 return false;
		},

		destroy : function() {

		}
	});
});
