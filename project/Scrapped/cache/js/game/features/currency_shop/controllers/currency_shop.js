define('features/currency_shop/controllers/currency_shop', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		BuyForGoldWindowFactory = window.BuyForGoldWindowFactory,
		ShopSubWindowView = require('features/currency_shop/views/currency_shop');

	return SubWindowController.extend({
		view: null,

		initialize: function (options) {
			SubWindowController.prototype.initialize.apply(this, arguments);
		},

		render: function ($el) {
			this.$el = $el;
			this.initializeView();
		},

		initializeView: function () {
			this.view = new ShopSubWindowView({
				controller: this,
				el: this.$el
			});
		},

		getWindowSkin: function () {
			if (!this.window_controller.hasOwnProperty('getWindowSkin')) {
				return;
			}

			return this.parent_controller.getWindowSkin();
		},

		getShopItems: function () {
			return this.getCollection('shop_items').getShopItems();
		},

		getShopItem: function (item_id) {
			return this.getCollection('shop_items').getShopItem(item_id);
		},

		buyItem: function (btn, item_id) {
			var shop_item = this.getShopItem(item_id),
				amount = shop_item.getAmount(),
				cost = shop_item.getGoldCost();

			BuyForGoldWindowFactory.openConfirmationBuyEventCurrency(btn, amount, cost, function () {
				shop_item.buyItem(this.close.bind(this));
			}.bind(this));
		},

		destroy: function () {

		}
	});
});