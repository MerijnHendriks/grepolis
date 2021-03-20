/*globals WF */

window.SpecialOfferWindowFactory= (function () {
	'use strict';

	return {
		/**
		 * Opens 'special_offer' window - default tab
		*/
		openWindow : function (interstitial_model) {
			WF.open('special_offer', {
				interstitial_model : interstitial_model
			});
		}
	};
}());
