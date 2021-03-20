/*global window */

define('events/turn_over_tokens/models/shop_item', function(require) {
    'use strict';

    var GrepolisModel = window.GrepolisModel;
	var AssassinsShopItem = GrepolisModel.extend({
		urlRoot : 'AssassinsShopItem',

		/**
		 * buys the given item and puts it to extended inventory
		 *
		 * @param callbacks
		 */
		buyItem : function(stash, callbacks) {
			this.execute('buyItem', {
				item_id : this.getId(),
				to_inventory: stash,
				currency_type: 'battle_tokens'
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
			return this.get('costs').battle_tokens;
		}
	});

	GrepolisModel.addAttributeReader(AssassinsShopItem.prototype,
		 'id',
		 'slot',
		 'costs',
		 'configuration'
	);

	window.GameModels.AssassinsShopItem = AssassinsShopItem;
	return AssassinsShopItem;
});
