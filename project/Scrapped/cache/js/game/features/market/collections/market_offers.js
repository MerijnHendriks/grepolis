/*global us, Backbone*/

(function() {
	'use strict';

	var ResourceOffer = window.GameModels.ResourceOffer;

	var MarketOffers = {

		model: ResourceOffer,
		model_class: 'ResourceOffer',
		action: 'getData',
		api: 'BuildingMarket',

		/** {function(): object} */
		extraParamFunc: function(){ return {}; },

		market_data: null, // keep track about capacity etc.

		url: 'none',

		setAction: function(action) {
			this.action = action;
		},

		getMarketData: function() {
			return this.market_data;
		},

		getPremiumExchangeOffersCount: function () {
			return this.premium_exchange_offers_count || 0;
		},

		/**
		 * Register a function that returns an object of extra params for the API call.
		 * Useful for adding filter or sort parameters.
		 *
		 * @param {function(): object} extraParamFunc
		 */
		registerExtraParamFunc: function(extraParamFunc) {
			this.extraParamFunc = extraParamFunc;
		},

		/*
		This is how a Pageablecollection can work with gpajax instead of using $.ajax directly
		First we catch sync, which is called from fetch and proxies Backbone.sync aka Backbone.$.ajax
		We redirect it to gpajax

		We also manipulate the success callback and remove the overhead from the legacy backend api
		(where models are just a part of the response)

		On $.Deferred:

		When doing a town switch gpajax queues the requests in window.request_stacks.current and
		calls all callbacks later but never returns a jqxhr like a "normal" request would.

		To not to break the contract for "sync", we return a "$.Deferred" instead and execute it as soon
		as the callback gets triggerd.

		 */
		sync: function(method, self, params) {
			var defer = $.Deferred(),
				extra_params = this.extraParamFunc(),
				limit = this.state.pageSize,
				offset = 0;

				if (this.state.currentPage > 0) {
					offset = limit * this.state.currentPage - this.getPremiumExchangeOffersCount();
				}

			var index_params = {
				model_url : this.api,
				action_name : this.action,
				'arguments': {
					limit: limit,
					offset: offset
				}
			};

			// Mix in additional arguments we get from the controller / like filters 'max_ratio' etc
			index_params['arguments'] = us.extend(index_params['arguments'], extra_params);

			var callback = function(data, index) {
				// collection attributes are everything except the offers array
				var market_data = us.clone(data);
				delete market_data.offers_array;

				this.market_data = market_data;

				if (this.state.currentPage === 0) {
					this.premium_exchange_offers_count = this.market_data.premium_exchange_offers_count;
				}

				this.state.totalRecords = market_data.offers_total + this.getPremiumExchangeOffersCount();
				this.state.totalPages = Math.ceil(market_data.offers_total / this.state.pageSize);
				
				// the upper layers are only interested in models
				var models_array = data.offers_array;
				params.success.call(this, models_array, index);
				$.when(defer);
				defer.resolve(true);
			}.bind(this);

			window.gpAjax.ajaxPost('frontend_bridge', 'execute', index_params, false, callback);

			return defer;
		}
	};

	window.GameCollections.MarketOffers = Backbone.PageableCollection.extend(MarketOffers);
}());
