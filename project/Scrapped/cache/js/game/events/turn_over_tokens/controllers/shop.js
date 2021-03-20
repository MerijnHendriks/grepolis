/* global us, GameEvents, Layout */

define('events/turn_over_tokens/controllers/shop', function(require) {
	'use strict';

	var AssassinsShopController;
	var GameControllers = window.GameControllers;
	var AssassinsShopView = require('events/turn_over_tokens/views/shop');
	//var RewardItem = require('models/reward_item');

	var SLOTS_AMOUNT = 16;

	AssassinsShopController = GameControllers.TabController.extend({
		view: null,


		initialize: function (options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.initializeView();
			this.registerEventListeners();

			return this;
		},

		initializeView: function () {
			this.view = new AssassinsShopView({
				controller: this,
				el: this.$el
			});
		},

		registerEventListeners: function () {
			var battleTokenHasChanged = function () {
				this.view.renderBattleTokens();
				this.view.updateBuyButtons();
			}.bind(this);

			var player_ledger = this.getPlayerLedger();

			player_ledger.onBattleTokensChange(this, battleTokenHasChanged);

			this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
		},

		getPlayerLedger : function() {
			return this.getModel('player_ledger');
		},

		getBattleTokens : function() {
			return this.getPlayerLedger().getBattleTokens();
		},

		getShopItemsPerSlot : function() {
			return this.getCollection('assassins_shop_items').getShopItemsPerSlot(SLOTS_AMOUNT);
		},

		_getFirstShopItemInSlot : function(slot_id) {
			return this.getShopItemsPerSlot()[slot_id][0];
		},

		getRewardForSlot : function(slot_id) {
			return this._getFirstShopItemInSlot(slot_id).getRewardItem();
		},

		getCostsForSlot : function(slot_id) {
			 return this._getFirstShopItemInSlot(slot_id).getCosts().battle_tokens;
		},

		buyShopItemFromSlot : function(slot_id, stash) {
			this._getFirstShopItemInSlot(slot_id).buyItem(stash);
		},

		showRewardContextMenuForSlot : function(event, slot_id) {
			var data = {
				event_group : {},
				id: slot_id,
				data: this.getRewardForSlot(slot_id)
			};

			us.extend(data.event_group, GameEvents.active_happening.reward);

			Layout.contextMenu( event, 'item_reward', data);
		},

		useReward: function(event, data) {
			//var slot_id = data.id,
				//reward_data = this._getFirstShopItemInSlot(slot_id).getConfiguration(),
				//reward = new RewardItem(reward_data);

			//reward.use(undefined, 'assassins');
			this.buyShopItemFromSlot(data.id, false);
		},

		stashReward : function(event, data) {
			//var slot_id = data.id,
				//reward_data = this._getFirstShopItemInSlot(slot_id).getConfiguration(),
				//reward = new RewardItem(reward_data);

			//reward.stash(undefined, 'assassins');
			this.buyShopItemFromSlot(data.id, true);
		},

		destroy: function () {

		}
	});

	return AssassinsShopController;
});
