/* global MM */

define('events/missions/helpers/tutorial', function() {

	'use strict';
	var PLAYER_HINT_KEY = 'missions_tutorial';

	/**
	 * Manages tutorial
	 */
	return {

		/**
		 * Checks if tutorial has been finished
		 */
		hasBeenCompleted: function() {
			var player_hint = MM.getOnlyCollectionByName('PlayerHint').getForType(PLAYER_HINT_KEY);
			return player_hint.isHidden();
		},

		/**
		 * Mark tutorial as finished
		 */
		markAsFinished: function() {
			var player_hint = MM.getOnlyCollectionByName('PlayerHint').getForType(PLAYER_HINT_KEY);
			player_hint.disable();
		},

		steps : {
			STEP_1: 'step_1',
			STEP_2: 'step_2',
			STEP_3: 'step_3',
			STEP_4: 'step_4',
			STEP_5: 'step_5',
			STEP_6: 'step_6',
			STEP_7: 'step_7',
			STEP_8: 'step_8',
			STEP_9: 'step_9'
		},

		getTutorialOrder : function() {
			return [
				this.steps.STEP_1,
				this.steps.STEP_2,
				this.steps.STEP_3,
				this.steps.STEP_4,
				this.steps.STEP_5,
				this.steps.STEP_6,
				this.steps.STEP_7,
				this.steps.STEP_8,
				this.steps.STEP_9
			];
		},

		showTutorial: function(window_parent_controller, set_on_after_close) {
			var SubWindowTutorialController = require('events/missions/controllers/sub_windows/tutorial'),
				controller = new SubWindowTutorialController({
					l10n : window_parent_controller.getl10n(),
					window_controller : window_parent_controller,
					templates : {
						tutorial: window_parent_controller.getTemplate('tutorial')
					},
					models : {},
					collections : {
						player_hints: window_parent_controller.getModel('player_hints')
					},
					cm_context : {
						main : window_parent_controller.getMainContext(),
						sub : 'tutorial'
					}
				});

			if (set_on_after_close) {
                controller.setOnAfterClose(set_on_after_close);
            }

			window_parent_controller.openSubWindow({
				controller : controller,
				skin_class_names : 'empty_window'
			});
		}

	};
});
