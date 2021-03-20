define('events/rota/collections/shop_items', function () {
	'use strict';

	var EventShopItems = require('features/currency_shop/collections/shop_items');
	var RotaEventShopItem = require('events/rota/models/shop_item');

	var RotaEventShopItems = EventShopItems.extend({
		model: RotaEventShopItem,
		model_class: 'RotaEventShopItem'
	});

	window.GameCollections.RotaEventShopItems = RotaEventShopItems;
	return RotaEventShopItems;
});
