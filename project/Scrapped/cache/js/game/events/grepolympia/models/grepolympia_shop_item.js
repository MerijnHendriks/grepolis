/*global window */

define('events/grepolympia/models/grepolympia_shop_item', function(require) {
    'use strict';

    var GrepolisModel = window.GrepolisModel;
	var GrepolympiaShopItem = GrepolisModel.extend({
		urlRoot : 'GrepolympiaShopItem',

		/**
		 * buys the given item and puts it to extended inventory
		 *
		 * @param callbacks
		 */
		buyItem : function(stash, callbacks) {
			this.execute('buyItem', {
				item_id : this.getId(),
				to_inventory: stash,
				currency_type: 'laurels'
			}, callbacks);
		},

		/**
		 * access the reward to create tooltips
		 *
		 * @returns {RewardItem}
		 */
		getRewardItem : function() {
			return this.getConfiguration();
		},

		getCosts : function() {
			return this.get('costs').laurels;
		}
	});

	GrepolisModel.addAttributeReader(GrepolympiaShopItem.prototype,
		 'id',
		 'slot',
		 'costs',
		 'configuration'
	);

	window.GameModels.GrepolympiaShopItem = GrepolympiaShopItem;
	return GrepolympiaShopItem;
});
