/*globals WF */

window.NoGoldDialogWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'no_gold_dialog' window - default tab
		 * @param {string} attempted_feature premium feature that the player tried to use
		 * @param {object} confirmation_data additional data such as callback functions for the not enough gold dialog
		*/
		openWindow : function (attempted_feature, confirmation_data) {
			WF.open('no_gold_dialog',
				{ args :
					{
						confirmation_data : confirmation_data,
						attempted_feature : attempted_feature
					}
				}
			);
		}

	};
}());
