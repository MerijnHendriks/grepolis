/* global us, GameEvents, Layout, TM */

define('events/grepolympia/controllers/grepolympia_shop', function(require) {
	'use strict';

	var GrepolympiaShopController,
		EventJsonTrackingController = require('controllers/common/event_json_tracking'),
		GrepolympiaShopView = require('events/grepolympia/views/grepolympia_shop'),
		GrepolympiaWindowFactory = require('events/grepolympia/factories/grepolympia_window_factory');

	var SLOTS_AMOUNT = 16;

	GrepolympiaShopController = EventJsonTrackingController.extend({
		view: null,


		initialize: function (options) {
			//Don't remove it, it should call its parent
			EventJsonTrackingController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			var model_discipline = this.getModel('grepolympia_discipline');
			if (model_discipline.getSecondsToTheEndOfDiscipline() > 0) {
				this.refresh_window_after = (model_discipline.getSecondsToTheEndOfDiscipline() + 1) * 1000;
				this.initializeDisciplineCountdown();
			}

			this.initializeView();
			this.registerEventListeners();

			return this;
		},

		initializeDisciplineCountdown : function() {
			var _self = this;
			TM.unregister('refresh_grepolympia_window');
			//Refresh window when discipline will change
			TM.once('refresh_grepolympia_window', _self.refresh_window_after, function() {
				_self.window_model.close();
				GrepolympiaWindowFactory.openWindow();
			});
		},

		initializeView: function () {
			this.view = new GrepolympiaShopView({
				controller: this,
				el: this.$el
			});
		},

		registerEventListeners: function () {
			var laurelsHasChanged = function () {
				this.view.setNewLaurelAmountToLaurel();
				this.view.updateBuyButtons();
			}.bind(this);

			var player_ledger = this.getPlayerLedger();

			player_ledger.onLaurelsChange(this, laurelsHasChanged);

			this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
		},

		getShopWindowType : function() {
			return this.getWindowModel().getType();
		},

		getPlayerLedger : function() {
			return this.getModel('player_ledger');
		},

		getLaurels : function() {
			return this.getPlayerLedger().getLaurels();
		},

		getShopItemsPerSlot : function() {
			return this.getCollection('grepolympia_shop_items').getShopItemsPerSlot(SLOTS_AMOUNT);
		},

		_getFirstShopItemInSlot : function(slot_id) {
			return this.getShopItemsPerSlot()[slot_id][0];
		},

		getRewardForSlot : function(slot_id) {
			return this._getFirstShopItemInSlot(slot_id).getRewardItem();
		},

		getCostsForSlot : function(slot_id) {
			 return this._getFirstShopItemInSlot(slot_id).getCosts().laurels;
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
			this.buyShopItemFromSlot(data.id, false);
		},

		stashReward : function(event, data) {
			this.buyShopItemFromSlot(data.id, true);
		},

		destroy: function () {

		}
	});

	return GrepolympiaShopController;
});
