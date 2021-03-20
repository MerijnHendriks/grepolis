/*global _, DM */

(function() {
	"use strict";

	DM.loadData({
		l10n: {
			//Default translations for the window (translations below will overwrite them)
			gold_trade_interstitial : {
				window_title: _("Trade gold for resources"),
				tabs: []
			},
			premium_exchange : {
				window_title: _("Gold exchange unlocked"),
				title : _("Gold exchange unlocked"),
				descr : _("You have unlocked the Gold exchange, to access it open the Market and go to the Gold exchange tab. In the gold exchange you have the ability to buy and sell resources for gold coins making it much easier to expand your city and empire."),
				button_caption : _("To the gold exchange")
			}
		}
	});
}());
