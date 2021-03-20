/*globals WF */

window.WorldWondersWelcomeWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'WorldWondersWelcome' window - default tab
		 */
		openWindow : function (age_of_wonder_started_at) {
			return WF.open('world_wonders_welcome',
				{
					args: {
                        age_of_wonder_started_at: age_of_wonder_started_at
					}
				});
		}
	};
}());