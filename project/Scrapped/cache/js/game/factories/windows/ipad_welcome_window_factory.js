/*globals WF */

window.IpadWelcomeWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'IpadWelcome' window - default tab
		 */
		openWindow : function () {
			return WF.open('ipad_welcome');
		}
	};
}());
