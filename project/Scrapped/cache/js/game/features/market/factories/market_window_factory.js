/* globals GameEvents */

window.MarketWindowFactory = (function () {
	'use strict';

	var windows = require('game/windows/ids'),
		Buildings = require('enums/buildings'),
		WF = window.WF;

	return {
		/**
		 * Opens 'market' window - default tab
		*/
		openWindow : function () {
			$.Observer(GameEvents.window.building.open).publish({building_id: Buildings.MARKET});
			WF.open(windows.MARKET);
		},

		/**
		 * @deprecated
		 *
		 * Old function name -> kept not to break Players Quickbars
		 */
		openMarketWindow : function() {
			this.openWindow();
		}
	};
}());
