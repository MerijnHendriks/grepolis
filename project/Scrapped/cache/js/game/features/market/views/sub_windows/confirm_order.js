define('market/views/sub_windows/confirm_order', function (require) {
    'use strict';

    var View = window.GameViews.BaseView;
    var OrderType = require('market/enums/order_type');

    return View.extend({
        initialize: function () {
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.render();
        },

        render: function () {
            this.renderConfirmOrder();
            this.registerConfirmOrderButton();
        },

        reRender: function () {
            this.render();
        },

        renderConfirmOrder: function () {
            var order = this.controller.getOrder(),
                matching_offer = this.controller.getMatchingOffer(),
                cost = 0,
                cost_type = 'gold';

            if (order.type === OrderType.BUY) {
                cost = matching_offer.gold_cost;
            } else {
                cost = matching_offer.resource_amount;
                cost_type = matching_offer.resource_type;
            }

            this.renderTemplate(this.$el, 'confirm_order', {
                l10n: this.l10n,
                order: order,
                matching_offer: matching_offer,
                duration: this.controller.getTradeDuration(),
                cost: cost,
                cost_type: cost_type,
                rate_changed: this.controller.getRateChanged()
            });
        },

        registerConfirmOrderButton: function () {
            this.unregisterComponent('btn_confirm');
            this.registerComponent('btn_confirm', this.$el.find('.btn_confirm').button({
                caption: this.l10n.button
            }).on('click', this.controller.onBtnConfirmOrderClick.bind(this.controller)));
        }
    });
});