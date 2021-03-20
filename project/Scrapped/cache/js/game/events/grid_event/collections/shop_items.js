define('events/grid_event/collections/shop_items', function () {
	'use strict';

	var EventShopItems = require('features/currency_shop/collections/shop_items');
	var GridEventShopItem = require('events/grid_event/models/shop_item');

	var GridEventShopItems = EventShopItems.extend({
		model: GridEventShopItem,
		model_class: 'GridEventShopItem'
	});

	window.GameCollections.GridEventShopItems = GridEventShopItems;
	return GridEventShopItems;
});
