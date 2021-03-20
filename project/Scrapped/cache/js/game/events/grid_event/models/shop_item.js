define('events/grid_event/models/shop_item', function () {
	'use strict';

	var EventShopItem = require('features/currency_shop/models/shop_item');
	var GridEventShopItem = EventShopItem.extend({
		urlRoot: 'GridEventShopItem'
	});

	window.GameModels.GridEventShopItem = GridEventShopItem;
	return GridEventShopItem;
});
