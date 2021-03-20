/*globals WF */

window.PhoenicianSalesmanWelcomeWindowFactory = (function () {
	'use strict';

	return {
		/**
		 * Opens 'PhoenicianSalesmanWelcome' window - default tab
		 */
		openWindow : function () {
			return WF.open('phoenician_salesman_welcome');
		}
	};
}());
