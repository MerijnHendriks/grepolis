define('events/grepolympia/collections/grepolympia_shop_items', function(require) {
    'use strict';

    var Collection = window.GrepolisCollection;
	var GrepolympiaShopItem = require('events/grepolympia/models/grepolympia_shop_item');

    var GrepolympiaShopItems = Collection.extend({
		model : GrepolympiaShopItem,
		model_class : 'GrepolympiaShopItem',

		getShopItems : function() {
			return this.models;
		},

		getRewards : function() {
			return this.models.map(function(item_model) {
				return item_model.getRewardItem();
			});
		},

		/**
		 * slot numbers start from 1
		 */
		getShopItemsPerSlot : function(slots_amount) {
			var res = [];
			for (var i = 1; i < slots_amount + 1; i++) {
				res[i] = this.getShopItemsForSlot(i);
			}
			return res;
		},

		getShopItemsForSlot : function(slot_id) {
			return this.filter(function(model) {
				return model.getSlot() === slot_id;
			});
		}

    });

	window.GameCollections.GrepolympiaShopItems = GrepolympiaShopItems;
	return GrepolympiaShopItems;
});
