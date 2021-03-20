define('events/grid_event/collections/inventory_items', function () {
	'use strict';

	var EventInventoryItemsCollection = window.GameCollections.EventInventoryItems;
	var GridEventInventoryItem = require('events/grid_event/models/inventory_item');

	var GridEventInventoryItems = EventInventoryItemsCollection.extend({
		model: GridEventInventoryItem,
		model_class: 'GridEventInventoryItem'
	});

	window.GameCollections.GridEventInventoryItems = GridEventInventoryItems;
	return GridEventInventoryItems;
});
