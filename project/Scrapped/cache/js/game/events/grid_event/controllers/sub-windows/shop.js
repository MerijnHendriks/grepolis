define('events/grid_event/controllers/sub-windows/shop', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		BuyForGoldWindowFactory = window.BuyForGoldWindowFactory,
		ShopSubWindowView = require('events/grid_event/views/sub-windows/shop');

	return SubWindowController.extend({
		view: null,

		initialize: function () {
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
			return this.parent_controller.getWindowSkin();
		},

		getGridEventsShopItems: function () {
			return this.getCollection('grid_event_shop_items');
		},

		getShopItems: function () {
			return this.getGridEventsShopItems().getShopItems();
		},

		buyItem: function (btn, item_id) {
			var shop_item = this.getGridEventsShopItems().getShopItem(item_id),
				amount = shop_item.getAmount(),
				cost = shop_item.getGoldCost();

			BuyForGoldWindowFactory.openConfirmationGridEventBuyCurrency(btn, amount, cost, function () {
				shop_item.buyItem(this.close.bind(this));
			}.bind(this));
		},

		destroy: function () {

		}
	});
});