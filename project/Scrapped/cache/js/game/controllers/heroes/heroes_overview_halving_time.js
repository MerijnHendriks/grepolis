/*global BuyForGoldWindowFactory */

(function() {
	'use strict';

	var Controller = window.GameControllers.HeroesOverviewController;

	var HeroesOverviewHalvingTimeController = Controller.extend({

		getViewClass : function() {
			return window.GameViews.HeroesOverviewHalvingTime;
		},

		onPremiumClick : function(_btn, hero_id) {
			var _self = this;
			BuyForGoldWindowFactory.openHalveHeroCureTimeForGoldWindow(_btn, function() {
				_self.halveCureTime(hero_id);
			});
		},

		halveCureTime : function(hero_id) {
			this.getHero(hero_id).halveCureTime();
		}

	});

	window.GameControllers.HeroesOverviewHalvingTimeController = HeroesOverviewHalvingTimeController;
}());
