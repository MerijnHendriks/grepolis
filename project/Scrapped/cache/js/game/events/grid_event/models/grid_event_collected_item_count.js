define('events/grid_event/models/grid_event_collected_item_count', function () {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var GridEventCollectedItemCount = GrepolisModel.extend({
		urlRoot: 'GridEventCollectedItemCount',

		getPreparedItems: function() {
			var prepared_items = [],
				items = this.getItems(),
				item;
			for (item in items) {
				if (items.hasOwnProperty(item)) {
					var item_details = {
						id: item,
						amount: items[item]
					};
					prepared_items.push(item_details);
				}
			}
			return prepared_items;
		},

		onCollectedItemChange: function (obj, callback) {
			obj.listenTo(this, 'change', callback);
		}
	});

	GrepolisModel.addAttributeReader(GridEventCollectedItemCount.prototype,
		'id',
		'items',
		'item_count'
	);

	window.GameModels.GridEventCollectedItemCount = GridEventCollectedItemCount;
	return GridEventCollectedItemCount;
});
