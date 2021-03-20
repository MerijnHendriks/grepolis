define('events/rota/models/inventory_item', function () {
	'use strict';

	var EventInventoryItemModel = window.GameModels.EventInventoryItem;
	var RotaEventInventoryItem = EventInventoryItemModel.extend({
		urlRoot: 'RotaEventInventoryItem'
	});

	window.GameModels.RotaEventInventoryItem = RotaEventInventoryItem;
	return RotaEventInventoryItem;
});
