/*global window */

define('events/turn_over_tokens/collections/shop_items', function(require) {
    'use strict';

    var Collection = window.GrepolisCollection;
	var AssassinsShopItem = require('events/turn_over_tokens/models/shop_item');

    var AssassinsShopItems = Collection.extend({
		model : AssassinsShopItem,
		model_class : 'AssassinsShopItem',

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

	window.GameCollections.AssassinsShopItems = AssassinsShopItems;
	return AssassinsShopItems;
});
