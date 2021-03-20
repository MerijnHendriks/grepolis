define('features/daily_login/controllers/daily_login', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var GameEvents = require('data/events');
	var HelperTown = require_legacy('HelperTown');
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
	var View = require('features/daily_login/views/daily_login');
	var GameDataDailyBonusStatic = require('features/daily_login/data/daily_bonus_static');

	return GameControllers.AcceptGiftController.extend({
		TIMER_NAME : 'daily_login_gift_expire',

		initialize : function(options) {
			GameControllers.AcceptGiftController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners : function() {
			this.observeEvent(GameEvents.god.change, this.reRender.bind(this));
			this.observeEvent(GameEvents.town.town_switch, this.reRender.bind(this));
			this.observeEvent(GameEvents.daily_login_bonus.reward.use, this.useReward.bind(this));
			this.observeEvent(GameEvents.daily_login_bonus.reward.stash, this.stashReward.bind(this));
			this.observeEvent(GameEvents.daily_login_bonus.reward.trash, this.trashReward.bind(this));

			this.daily_login_model.onRewardsChange(this, this.onModelChanged.bind(this));
		},

		reRender : function() {
			this.clearExpirationInterval();
			this.setExpirationInterval(this.TIMER_NAME, this.getExpireDate());
			this.view.reRender();
		},

		renderPage: function() {
			this.initializeView();
			this.setExpirationInterval(this.TIMER_NAME, this.getExpireDate());
		},

		initializeView : function() {
			this.daily_login_model = this.getModel('daily_login_bonus');
			this.view = new View({
				controller : this,

				el : this.$el
			});
			this.registerEventListeners();
		},

		getExpireDate : function() {
			return this.daily_login_model.getExpireDate();
		},

		getFavorReward : function() {
			return GameDataDailyBonusStatic.getRewardsList()[this.getLevel()].favor;
		},

		getGiftId : function() {
			return this.daily_login_model.getId();
		},

		getLevel : function() {
			return this.daily_login_model.getLevel() || 0;
		},

		getResourcesReward : function() {
			return GameDataDailyBonusStatic.getRewardsList()[this.getLevel()].resources;
		},

		getRewardData : function() {
			return this.daily_login_model.getRewardData();
		},

		hasGodInTown : function() {
			var god_id = HelperTown.getGodForCurrentTown();
			return god_id !== null;
		},

		isMysteryBoxOpen : function() {
			return this.daily_login_model.getOpen();
		},

		useReward: function() {
			this.daily_login_model.useReward(this.closeWindow.bind(this));
		},

		stashReward : function() {
			this.daily_login_model.stashReward(this.closeWindow.bind(this));
		},

		trashReward : function() {
			this.daily_login_model.trashReward(this.closeWindow.bind(this));
		},

		onModelChanged : function() {
			if(this.getRewardData() !== null) {
				this.getWindowModel().hideLoading();
				this.view.startOpenMysteryBoxAnimation();
			} else {
				this.reRender();
			}
		},

		onAcceptRewardBtnClick : function(gift_id, option) {

			var gift_data,
				simple_data,
				ResourceRewardDataFactory = require('factories/resource_reward_data_factory');

			// option "0" indicates the resource reward, option "1" the favor reward
			if (option === 0) {
				gift_data = {
					wood : this.getResourcesReward(),
					stone : this.getResourcesReward(),
					iron : this.getResourcesReward()};
			} else {
				gift_data = { favor : this.getFavorReward() };
			}
			simple_data = ResourceRewardDataFactory.fromDailyLoginGift(gift_data);

			ConfirmationWindowFactory.openConfirmationWastedResources(function() {
				this.daily_login_model.acceptReward(option, this.closeWindow.bind(this));

			}.bind(this), null, simple_data);
		},

		onOpenMysteryBox : function() {
			this.getWindowModel().showLoading();
			this.daily_login_model.openMysteryBox();
		}
	});
});

