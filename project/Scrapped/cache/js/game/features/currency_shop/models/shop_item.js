define('features/currency_shop/models/shop_item', function () {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var EventShopItem = GrepolisModel.extend({
		buyItem: function (callback) {
			this.execute('buyItem', {
				item_id: this.getId()
			}, callback);
		},

		getGoldCost: function () {
			var costs = this.getCosts();
			return costs.gold;
		}
	});

	GrepolisModel.addAttributeReader(EventShopItem.prototype,
		'id',
		'configuration',
		'amount',
		'costs'
	);

	return EventShopItem;
});
