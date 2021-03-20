/*globals WF*/

window.CrmWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'Crm interstitial' window - default tab
		 */
		openWindow: function (window_type, crm_campaign, display_points) {
			return WF.open(window_type, {
				args: {
					active_crm_campaign : {
						crm_campaign : crm_campaign
					},
					current_display_points : display_points
				}
			});
		}
	};
}());