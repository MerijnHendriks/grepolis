define('features/color_picker/factories/color_picker', function() {
	'use strict';

	var WF = require_legacy('WF');
	var windows = require('game/windows/ids');
	var window_type = windows.COLOR_PICKER;

	return {
		/**
		 *
		 * @param type - type of the window, can be text, alliance, player, enemy, pact (mandatory)
		 * @param id - player or alliance id (mandatory)
		 * @param callback - the callback function which will be fired when a different color is assigned to the type (mandatory)
		 * @param window_position - position of the color picker window (optional)
		 * @param color - the color which is assigned to the type (optional)
		 * @param additional_id - other id needed for getting default colors (for example the alliance id for the type player) (optional)
		 * @param target_name - name of the alliance or player (if not pact, enemy or own alliance)
		 */
		openWindow : function (type, id, callback, window_position, color, additional_id, target_name) {
			WF.open(window_type,
					{args:
							{
								window_position: window_position,
								type: type,
								id: id,
								color : color,
								callback : callback,
								additional_id : additional_id,
								target_name: target_name
							}
					}
			);
		}
	};
});