define('events/grid_event/models/inventory_item', function () {
	'use strict';

	var EventInventoryItemModel = window.GameModels.EventInventoryItem;
	var GridEventInventoryItem = EventInventoryItemModel.extend({
		urlRoot: 'GridEventInventoryItem'
	});

	window.GameModels.GridEventInventoryItem = GridEventInventoryItem;
	return GridEventInventoryItem;
});
