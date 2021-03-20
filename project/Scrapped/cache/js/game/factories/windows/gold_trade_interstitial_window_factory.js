/*globals WF, DM, MarketWindowFactory */

window.GoldTradeInterstitialWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'gold_trade_interstitial' window - default tab
		 */
		openUnlockedWindow : function () {
            var l10n = DM.getl10n('premium_exchange');

			WF.open('gold_trade_interstitial', {
				l10n : l10n,
				action : function() {
					MarketWindowFactory.openWindow();
					this.closeWindow();
				},
				state : 'unlocked'
			});
		}
	};
}());
