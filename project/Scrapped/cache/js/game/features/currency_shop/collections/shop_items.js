define('features/currency_shop/collections/shop_items', function () {
	'use strict';

	var Collection = window.GrepolisCollection;

	return Collection.extend({
		getShopItems: function () {
			return this.models;
		},


		getShopItem: function (item_id) {
			return this.models.find(function (model) {
				return model.getId() === item_id;
			});
		}
	});
});
