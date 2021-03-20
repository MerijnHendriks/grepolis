(function () {
	'use strict';

	var WF = window.WF;

	var Hercules2014CollectWindowFactory = {
		/**
		 * Opens 'Hercules2014Collect' window - default tab
		 */
		openWindow : function () {
			return WF.open('hercules2014_collect');
		}
	};

	window.Hercules2014CollectWindowFactory = Hercules2014CollectWindowFactory;
}());
