/* globals gpAjax, GameEvents, RecaptchaWindowFactory, ConfirmationWindowFactory, NoGoldDialogWindowFactory */

define('market/controllers/sub_windows/confirm_order', function (require) {
    'use strict';

    var GameControllers = window.GameControllers;
    var ConfirmOrderView = require('market/views/sub_windows/confirm_order'),
        ConfirmOfferSuccess = require('market/enums/confirm_offer_success'),
        MarketHelper = require('market/helper/market'),
        OrderType = require('market/enums/order_type');

    return GameControllers.SubWindowController.extend({
        view: null,

        initialize: function (options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);
            this.order = options.order;
            this.matching_offer = options.matching_offer;
            this.mac = options.mac;
            this.rate_changed = false;
            this.handleExchangeData = options.handleExchangeData;
        },

        render: function ($content_node) {
            this.$el = $content_node;
            this.initializeView();
            return this;
        },

        initializeView: function () {
            this.view = new ConfirmOrderView({
                controller: this,
                el: this.$el
            });

            this.registerEventListeners();
        },

        registerEventListeners: function () {
            this.stopObservingEvent(GameEvents.town.town_switch);
            this.observeEvent(GameEvents.town.town_switch, this.close.bind(this));
        },

        getOrder: function () {
            return {
                resource_type: this.order.resource_type,
                resource_amount: this.order.resource_amount,
                gold_cost: this.order.gold,
                type: this.order.type
            };
        },

        getMatchingOffer: function () {
            return {
                resource_type: this.matching_offer.resource_type,
                resource_amount: this.matching_offer.resource_amount,
                gold_cost: this.matching_offer.gold,
                captcha_required: this.matching_offer.captcha_required
            };
        },

        getRateChanged: function () {
            return this.rate_changed;
        },

        getTradeDuration: function () {
            return MarketHelper.getPremiumExchangeTradeDuration();
        },

        handleRateChanged: function (data) {
            this.matching_offer = data.offer;
            this.mac = data.mac;
            this.rate_changed = true;
            this.view.reRender();
        },

        openConfirmationPromptForPremiumExchangeConfirmOffer: function (matching_offer) {
            ConfirmationWindowFactory.openConfirmationPremiumExchangeConfirmOrder(
                this.confirmOffer.bind(this),
                null,
                matching_offer.resource_amount,
                matching_offer.resource_type,
                matching_offer.gold_cost
            );
        },

        onBtnConfirmOrderClick: function () {
            var matching_offer = this.getMatchingOffer();

            if (this.order.type === OrderType.BUY) {
                if (this.getModel('player_ledger').getGold() < matching_offer.gold_cost) {
                    NoGoldDialogWindowFactory.openWindow('premium_exchange_confirm_order');
                    return;
                }
                this.openConfirmationPromptForPremiumExchangeConfirmOffer(matching_offer);
            } else if (matching_offer.captcha_required) {
                RecaptchaWindowFactory.openRecaptchaWindow(function (payload) {
                    this.captcha = payload;
                    this.confirmOffer();
                }.bind(this));
            } else {
                this.confirmOffer();
            }
        },

        confirmOffer: function () {
            var params = {
                model_url: 'PremiumExchange',
                action_name: 'confirmOffer',
                'arguments': {
                    type: this.matching_offer.type,
                    gold: this.matching_offer.gold,
                    mac: this.mac,
                    offer_source: this.window_controller.getActivePageNr() === 1 ? 'preset' : 'main',
                    captcha: this.captcha
                }
            };

            params['arguments'][this.matching_offer.resource_type] = this.matching_offer.resource_amount;

            gpAjax.ajaxPost('frontend_bridge', 'execute', params, true, function (data) {
                if (typeof this.handleExchangeData === 'function') {
                    this.handleExchangeData(data.exchange);
                }

                if (data.result === ConfirmOfferSuccess.SUCCESS) {
                    this.close();
                } else if (data.result === ConfirmOfferSuccess.RATE_CHANGED) {
                    this.handleRateChanged(data);
                }
            }.bind(this));
        },

        destroy: function () {

        }
    });
});
