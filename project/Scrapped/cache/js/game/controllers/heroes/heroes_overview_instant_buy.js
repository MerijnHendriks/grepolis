/*global GameDataInstantBuy, ConstructionQueueHelper, BuyForGoldWindowFactory */

(function() {
	'use strict';

	var Controller = window.GameControllers.HeroesOverviewController;

	var HeroesOverviewInstantBuyController = Controller.extend({

		getViewClass : function() {
			return window.GameViews.HeroesOverviewInstantBuy;
		},

		onPremiumClick : function(_btn, hero_id) {
			var hero = this.getHero(hero_id),
				price = GameDataInstantBuy.getPriceForType(this.getInstantBuyType(), hero.getHealingTimeLeft());

			BuyForGoldWindowFactory.openInstantBuyHeroHealForGoldWindow(_btn, price, function() {
				hero.healInstant();
			});
		},

		getInstantBuyType : function() {
			return ConstructionQueueHelper.HERO;
		},

		registerFeatureBlockingUpdates : function(callback) {
			this.getCollection('feature_blocks').onFeatureBlocksCountChange(this, function() {
				//Register timer to check for next block (end or start)
				callback();
			}.bind(this));
		},

		_registerUpdatePremiumButtonsCaptionsTimer : function(hero, callback) {
			var timer_id = 'update_premium_buttons_captions_' + hero.getId(),
				time_left = this._getIntervalForNextSoftCapCheck(hero);

			this.unregisterTimer(timer_id);

			if (time_left !== -1) {
				this.registerTimerOnce(timer_id, time_left * 1000, function() {
					// re-register timer and execute callback
					this._registerUpdatePremiumButtonsCaptionsTimer(hero, callback);
					callback();
				}.bind(this));
			}
		},

		_registerUpdatePremiumButtonBlockingTimer : function(hero, callback) {
			var timer_id = 'next_block_check_' + hero.getId(),
				time_left = this.getCollection('feature_blocks')
					.getTheClosestTimeForNextBlockCheckForInstantBuy(hero.getOriginTownId());

			this.unregisterTimer(timer_id);

			callback();

			if (time_left !== -1) {
				this.registerTimerOnce(timer_id, time_left * 1000, function() {
					// re-register timer and execute callback
					this._registerUpdatePremiumButtonBlockingTimer(hero, callback);
					callback();
				}.bind(this));
			}
		},

		_getIntervalForNextSoftCapCheck: function(hero) {
			var table = GameDataInstantBuy.getPriceTableForType(this.getInstantBuyType()),
				time_left =  hero.getHealingTimeLeft(),
				time_missing = function(time) { return time - time_left < 0; },
				next_interval = us.find(Object.keys(table).reverse(), time_missing);

			return (time_left - next_interval) || -1;
		},

		getCurrentInstantBuyCost : function(hero) {
			var time_left = hero.getHealingTimeLeft(),
				price = GameDataInstantBuy.getPriceForType(this.getInstantBuyType(), time_left);

			return price;
		},

		isHeroInstantBuyDisabled : function(hero) {
			return !hero.isInjured() ||
				this._isInstantBuyBlocked(hero.getOriginTownId());
		},

		_isInstantBuyBlocked : function(town_id) {
			return this.getCollection('feature_blocks').isInstantBuyBlocked(town_id);
		}
	});

	window.GameControllers.HeroesOverviewInstantBuyController = HeroesOverviewInstantBuyController;
}());
