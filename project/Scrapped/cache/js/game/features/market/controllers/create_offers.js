/*global define, Game, GameData */

define('market/controllers/create_offers', function() {
	'use strict';

	var controllers = window.GameControllers;
	var MarketCreateOffersView = require('market/views/create_offers');
	var MarketHelper = require('market/helper/market');
	var readableRatio = window.readableRatio;
	var visibility_options = null;
	var resource_options = null;
	var ratio = null;

	return controllers.TabController.extend({
		view : null,

		initialize : function(options) {
			controllers.TabController.prototype.initialize.apply(this, arguments);

			this.registerEvents();
			if (!this.window_model.hasKey('create_offer')) {
				this.window_model.setData('create_offer', {
					offer_type : 'wood',
					demand_type : 'stone',
					offer : 0,
					demand : 0
				});
			}

			resource_options = [
				{value : 'wood'},
				{value : 'stone'},
				{value : 'iron'}
			];
		},

		registerEvents : function() {
			this.stopObservingEvent(window.GameEvents.town.town_switch);

			this.observeEvent(window.GameEvents.town.town_switch, function() {
				this.create_offer.reFetch(function() {
					this.updateWindowTitle();
					this.reRender();
				}.bind(this));
			}.bind(this));
		},

		registerEventListener : function() {
			this.stopListening();

			var current_town = this.getCollection('towns').getCurrentTown();
			current_town.onAvailableTradeCapacityChange(this, this.reRender.bind(this));

			this.create_offer.onChange(this, this.reRender.bind(this));
		},

		initializeView : function() {
			this.create_offer = this.getModel('create_offers');

			if (this.hasMarket()) {
				var data = this.window_model.getData('create_offer');
				ratio = data.offer > 0 && data.demand > 0 ? (Math.floor(data.demand / data.offer * 100) || 0) / 100 : 0;
				MarketHelper.showMarketTabs(this);
				visibility_options = this.getVisibilityOptions();
				if(!this.window_model.getData('create_offer').visibility) {
					this.setVisibility('all');
				}
				if(!this.window_model.getData('create_offer').life_time) {
					this.setLifeTime('00:30:00');
				}
				this.checkOfferAndDemand();
			} else {
				this.hideAllTabs();
			}
			this.view = new MarketCreateOffersView({
				controller : this,
				el : this.$el,
				has_market : this.hasMarket()
			});
			this.registerEventListener();
			if (this.hasMarket()) {
				this.updateRatio();
				this.adjustSpinner();
			}
		},

		updateWindowTitle : function() {
			this.setWindowTitle(GameData.buildings.market.name + ' (' + Game.townName + ')');
		},

		reRender: function() {
			this.getWindowModel().hideLoading();
			this.initializeView();
		},

		getResourceOptions : function() {
			return resource_options;
		},

		setOfferType : function(value) {
			var data = this.window_model.getData('create_offer');
			data.offer_type = value;
			this.window_model.setData(data);
		},

		setDemandType : function(value) {
			var data = this.window_model.getData('create_offer');
			data.demand_type = value;
			this.window_model.setData(data);
		},

		getOfferType : function() {
			return this.window_model.getData('create_offer').offer_type;
		},

		getDemandType : function() {
			return this.window_model.getData('create_offer').demand_type;
		},

		getAvailableCapacity : function() {
			var current_town = this.getCollection('towns').getCurrentTown();

			return current_town.getAvailableTradeCapacity();
		},

		getMaxCapacity : function() {
			return this.create_offer.getMaxCapacity();
		},

		hasAlliance : function() {
			return this.create_offer.getHasAlliance();
		},

		hasMarket : function() {
			return MarketHelper.hasMarket();
		},

		checkOfferAndDemand : function() {
			if(this.getOffer() > this.getAvailableCapacity()) {
				this.setOffer(this.getAvailableCapacity());
				if(this.getDemand() > this.getAvailableCapacity() * Game.constants.market.max_exchange_ratio) {
					this.setDemand(this.getAvailableCapacity() * Game.constants.market.max_exchange_ratio);
				}
			}
		},

		setOffer : function(value) {
			var data = this.window_model.getData('create_offer');
			data.offer = value;
			this.window_model.setData(data);
		},

		setDemand : function(value) {
			var data = this.window_model.getData('create_offer');
			data.demand = value;
			this.window_model.setData(data);
		},

		getOffer : function() {
			return this.window_model.getData('create_offer').offer;
		},

		getDemand : function() {
			return this.window_model.getData('create_offer').demand;
		},

		adjustSpinner : function() {
			var demand_step =  500,
				offer_step  = 500,
				demand_max  = Game.constants.market.max_resources_for_trade,
				offer_max   = Math.min(Game.constants.market.max_resources_for_trade, this.getAvailableCapacity()),
				demand_min = 0,
				offer_min = 0;

			this.view.sp_trading_demand.setStep(demand_step);
			this.view.sp_trading_offer.setStep(offer_step);
			this.view.sp_trading_demand.setMax(demand_max);
			this.view.sp_trading_offer.setMax(offer_max);
			this.view.sp_trading_demand.setMin(demand_min);
			this.view.sp_trading_offer.setMin(offer_min);
		},

		setButtonStateAndTooltip : function(enabled, msg) {
			var btn_submit = this.view.submit_offer;

			btn_submit.setState(!enabled);
			btn_submit.disable(!enabled);
			btn_submit.setTooltip(msg, enabled ? 0 : 1);
		},

		makeOffer : function(params_data) {
			var params = params_data,
				_self = this;

			_self.view.submit_offer.disable();

			_self.create_offer.createOffer(params);
		},

		renderPage : function() {
			this.initializeView();
			return this;
		},

		updateRatio : function() {
			var data = this.window_model.getData('create_offer');
			var ratio_demand = Math.floor(data.demand),
				ratio_offer = Math.floor(data.offer);
			ratio = ratio_demand / ratio_offer;

			if (isNaN(ratio) || ratio === Number.POSITIVE_INFINITY) {
				ratio = 0;
			}

			// truncate to 2 decimal places
			var truncated_ratio = Math.floor(ratio*100) / 100;

			if (data.demand === 0 || data.offer === 0) {
				truncated_ratio = window.readableRatio(1);
			} else {
				truncated_ratio = window.readableRatio(data.offer / data.demand );
			}

			if (this.view.lbl_ratio) {
				this.view.lbl_ratio.setCaption(truncated_ratio);
			}

			var current_resources = this.getCollection('towns').getCurrentTown().getResources(),
				trade_allowed = this.isTradeAllowed(current_resources),
				state = (trade_allowed.id === 'allowed');

			this.setButtonStateAndTooltip(state, trade_allowed.message);
		},

		/**
		 * Checks if the trade is allowed (ratios, min amount of resources).
		 *
		 * @param  {Number}  offered amount
		 * @param  {String}  offer_type
		 * @param  {Number}  demanded amount
		 * @param  {String}  demand_type
		 * @return {Object}  message 'allowed' or a string describing the error type
		 */
		isTradeAllowed: function(current_resources) {
			var data = this.window_model.getData('create_offer');
			var min_sum = Game.constants.market.min_trading_sum;

			if (data.offer > this.getAvailableCapacity()) {
				return {
					id: 'not_enough_capacity',
					message: this.l10n.not_enough_capacity(this.getAvailableCapacity())};
			}

			if (data.offer < min_sum || data.demand < min_sum) {
				return { id : 'min_trading_sum_no_premium', message : this.l10n.min_trading_sum_no_premium(Game.constants.market.min_trading_sum) };
			}

			if (ratio > Game.constants.market.max_exchange_ratio || ratio < 1/Game.constants.market.max_exchange_ratio) {
				return { id : 'max_exchange_ratio', message : this.l10n.max_exchange_ratio(readableRatio(Game.constants.market.max_exchange_ratio), readableRatio(1/Game.constants.market.max_exchange_ratio.toFixed(2))) };
			}

			if (data.offer > current_resources[data.offer_type]) {
				return {id: 'not_enough_resources', message: this.l10n.not_enough_resources};
			}

			return { id : 'allowed', message : this.l10n.create_offer };
		},

		setVisibility : function(value) {
			var data = this.window_model.getData('create_offer');
			data.visibility = value;
			this.window_model.setData(data);
		},

		getVisibility : function() {
			return this.window_model.getData('create_offer').visibility;
		},

		getVisibilityOptions : function() {
			return this.create_offer.getVisibilityOptions();
		},

		getRatio : function() {
			return ratio;
		},

		setLifeTime : function(value) {
			var data = this.window_model.getData('create_offer');
			data.life_time = value;
			this.window_model.setData(data);
		},

		getLifeTime : function() {
			return this.window_model.getData('create_offer').life_time;
		},

		destroy : function() {
		}
	});
});
