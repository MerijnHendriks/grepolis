// Factory for opening the domination era started notification popup
define('features/notification_popup/factories/domination_era_started_popup', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		WF = require_legacy('WF'),
		window_type = windows.DOMINATION_ERA_STARTED;

	return {
		openWindow : function (notification_type, additional_data) {
			WF.open(window_type, {
				args: {
					notification_type: notification_type,
					additional_data: additional_data
				}
			});
		}
	};
});