(function () {
	'use strict';

	var WF = window.WF;

	var Hercules2014WindowFactory = {
		/**
		 * Opens 'Hercules2014' window - default tab
		*/
		openWindow : function () {
			return WF.open('hercules2014', {
				args: {
					has_hero_reward: false
				}
			});
		},

		openCollectWindow : function() {
			return WF.open('hercules2014_collect');
		}
	};

	window.Hercules2014WindowFactory = Hercules2014WindowFactory;
}());
