/* global MM */

define('features/overlay_tutorial/helpers/tutorial', function() {
	'use strict';

	/**
	 * Manages tutorial
	 */
	return {
		/**
		 * Checks if tutorial has been finished
		 */
		hasBeenCompleted: function(player_hint_key) {
			var player_hint = MM.getOnlyCollectionByName('PlayerHint').getForType(player_hint_key);
			return player_hint.isHidden();
		},

		/**
		 * Mark tutorial as finished
		 */
		markAsFinished: function(player_hint_key) {
			var player_hint = MM.getOnlyCollectionByName('PlayerHint').getForType(player_hint_key);
			player_hint.disable();
		},

		showTutorial: function(window_controller, player_hint_key) {
			var SubWindowTutorialController = require('features/overlay_tutorial/controllers/tutorial'),
				controller = new SubWindowTutorialController({
					l10n : window_controller.getl10n(),
					window_controller : window_controller,
					templates : {
						tutorial: window_controller.getTemplate('tutorial')
					},
					models : {},
					collections : {
						player_hints: window_controller.getModel('player_hints')
					},
					cm_context : {
						main : window_controller.getMainContext(),
						sub : 'tutorial'
					},
					player_hint_key: player_hint_key
				});

			window_controller.openSubWindow({
				controller : controller,
				skin_class_names : 'empty_window'
			});
		}

	};
});
