/* globals GameEvents, gpAjax, GameData, Game */
define('market/controllers/premium_exchange', function () {
    'use strict';

    var TabController = window.GameControllers.TabController;
    var PremiumExchangeView = require('market/views/premium_exchange'),
        MarketHelper = require('market/helper/market'),
        OrderType = require('market/enums/order_type');

    return TabController.extend({
        view: null,

        initialize: function (options) {
            TabController.prototype.initialize.apply(this, arguments);
            this.updateWindowTitle();
            this.premium_exchange_constants = Game.constants.market.premium_exchange;
            this.current_order = {
                type: 'buy',
                resource_type: null,
                resource_amount: 0,
                gold: 0
            };
        },

        renderPage: function () {
            if (this.hasMarket()) {
                MarketHelper.showMarketTabs(this);
                if (this.getActivePageNr() !== this.model.getIndex()) {
                    return;
                }

                this.fetchExchangeData(this.initializeView.bind(this));
            } else {
                this.hideAllTabs();
                this.initializeView();
            }
        },

        initializeView: function (data) {
            this.setExchangeData(data);

            if (this.view) {
                this.view.reRender();
            } else {
                this.view = new PremiumExchangeView({
                    controller: this,
                    el: this.$el
                });
            }

            this.registerEventListeners();
        },

        registerEventListeners: function () {
            var current_town = this.getCollection('towns').getCurrentTown();

            this.stopListening();
            current_town.onAvailableTradeCapacityChange(this, this.view.updateAvailableCapacity.bind(this.view));
            current_town.onMaxTradeCapacityChange(this, this.view.updateMaxCapacity.bind(this.view));

            this.stopObservingEvent(GameEvents.town.town_switch);
            this.observeEvent(GameEvents.town.town_switch, this.renderPage.bind(this));
        },

        updateWindowTitle : function() {
            this.setWindowTitle(GameData.buildings.market.name + ' (' + Game.townName + ')');
        },

        getMaxCapacity: function () {
            var current_town = this.getCurrentTown();
            return current_town.getMaxTradeCapacity();
        },

        getAvailableCapacity: function () {
            var current_town = this.getCurrentTown();
            return current_town.getAvailableTradeCapacity();
        },

        getAvailableResourcesInTown: function (resource) {
            var current_town = this.getCurrentTown();
            return current_town.getResource(resource);
        },

        getStorageCapacity: function () {
           var current_town = this.getCurrentTown();
           return current_town.getStorageCapacity();
        },

        getAvailableResourcesForTrade: function (resource) {
            return this.exchange_data[resource].stock;
        },

        getMaxResourcesForTrade: function (resource) {
            return this.exchange_data[resource].capacity;
        },

        getCurrentTown: function () {
            return this.getCollection('towns').getCurrentTown();
        },

        getSeaId: function () {
            return this.exchange_data.sea_id;
        },

        getCurrentOrderType: function () {
            return this.current_order.type;
        },

        getTradeDuration: function () {
            return MarketHelper.getPremiumExchangeTradeDuration();
        },

        setCurrentOrderResource: function (resource, amount) {
            this.current_order.resource_type = resource;
            this.current_order.resource_amount = amount;
        },

        setCurrentOrderGold: function (amount) {
            this.current_order.gold = amount;
        },

        setCurrentOrderType: function (type) {
            this.current_order.type = type;
        },

        onBtnFindBestRatesClick: function () {
            this.requestOffer();
        },

        requestOffer: function () {
            var callback = function (data) {
                var sub_window = MarketHelper.openWindowConfirmOrder(
                    this,
                    this.current_order,
                    data,
                    this.getModels(),
                    this.setExchangeData.bind(this)
                );
                sub_window.setOnAfterClose(this.view.reRender.bind(this.view));
                this.setExchangeData(data.exchange);
            }.bind(this);

            MarketHelper.requestPremiumExchangeOffer(this.current_order, callback);
        },

        fetchExchangeData: function (callback) {
            var params = {
                model_url: 'PremiumExchange',
                action_name: 'read'
            };

            if (typeof callback !== 'function') {
                callback = function (data) {
                    this.setExchangeData(data);
                    this.view.reRender();
                }.bind(this);
            }

            gpAjax.ajaxGet('frontend_bridge', 'execute', params, true, callback);
        },

        setExchangeData: function (data) {
            this.exchange_data = data;
        },

        hasMarket: function() {
            return MarketHelper.hasMarket();
        },

        hasNeededLevelForPremiumExchange: function () {
            return MarketHelper.hasNeededLevelForPremiumExchange();
        },

        calculateMarginalPrice: function (stock, capacity) {
            return this.premium_exchange_constants.resource_base_price -
                (this.premium_exchange_constants.resource_price_elasticity * stock /
                    (capacity + this.premium_exchange_constants.stock_size_modifier));
        },

        calculateGoldPriceFor: function (amount, resource) {
            var exchange_stock = this.getAvailableResourcesForTrade(resource),
                exchange_capacity = this.getMaxResourcesForTrade(resource),
                result = (this.calculateMarginalPrice(exchange_stock, exchange_capacity) +
                    this.calculateMarginalPrice(exchange_stock - amount, exchange_capacity)) * (amount / 2);

            return result;
        },

        getEstimatedPrice: function (amount, resource) {
            var estimated_price = 0;

            if (this.getCurrentOrderType() === OrderType.BUY) {
                estimated_price = this.calculateGoldPriceFor(amount, resource);
                estimated_price *= 1 + this.premium_exchange_constants.tax_rate;
                estimated_price = Math.ceil(estimated_price);
            } else {
                amount = -(amount);
                estimated_price = -(this.calculateGoldPriceFor(amount, resource));
                estimated_price = Math.floor(estimated_price);
            }

            return estimated_price;
        }
    });
});
