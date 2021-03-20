define('events/rota/collections/inventory_items', function () {
	'use strict';

	var EventInventoryItemsCollection = window.GameCollections.EventInventoryItems;
	var RotaEventInventoryItem = require('events/rota/models/inventory_item');

	var RotaEventInventoryItems = EventInventoryItemsCollection.extend({
		model: RotaEventInventoryItem,
		model_class: 'RotaEventInventoryItem'
	});

	window.GameCollections.RotaEventInventoryItems = RotaEventInventoryItems;
	return RotaEventInventoryItems;
});
