define('features/world_wonder_donations/factories/world_wonder_donations', function() {
	'use strict';

	var WF = require_legacy('WF');
	var windows = require('game/windows/ids');

	return {
		openWindow : function(wonder_type) {
			var window_type = windows.WORLD_WONDER_DONATIONS;
			return WF.open(window_type, {
				args: {
					wonder_type: wonder_type
				}
			});
		}
	};
});
