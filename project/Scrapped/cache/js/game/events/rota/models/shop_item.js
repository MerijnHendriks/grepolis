define('events/rota/models/shop_item', function () {
	'use strict';

	var EventShopItem = require('features/currency_shop/models/shop_item');
	var RotaEventShopItem = EventShopItem.extend({
		urlRoot: 'RotaEventShopItem'
	});

	window.GameModels.RotaEventShopItem = RotaEventShopItem;
	return RotaEventShopItem;
});
