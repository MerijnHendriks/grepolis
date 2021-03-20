/*globals WF */

window.UpdateNotificationWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'update_notification' window - default tab
		*/
		openWindow : function () {
			WF.open('update_notification');
		}
	};
}());
