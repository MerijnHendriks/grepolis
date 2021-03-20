/* global MM, us */

define('events/turn_over_tokens/helper/tutorial', function() {

	'use strict';

	var PLAYER_HINT_PREFIX = 'assassins_tutorial_';

	/** @type {GameCollections.PlayerHints} */
	var	player_hints = null;

	/**
	 * @param {string} step - id of the step
	 * @return {GameCollections.PlayerHints}
	 */
	function getHint(step) {
		return player_hints.getForType(PLAYER_HINT_PREFIX + step);
	}

	/**
	 * This object manages which tutorial steps are available and which have been shown already.
	 * The information is persisted on the backend side with player-hints
	 */
	var AssassinsTutorial = {

		/**
		 * Needs to be called once, after PlayerHint collection is available
		 */
		init: function() {
			player_hints = MM.getCollections().PlayerHint[0];
		},

		/** @param {string} step */
		saveStepAsSeen : function(step) {
			getHint(step).disable();
		},

		/**
		 * @param {string} step
		 * @return {boolean}
		 */
		isStepSeen : function(step) {
			return getHint(step).isHidden();
		},

		resetStep: function(step) {
			getHint(step).enable();
		},

		/**
		 * Remove any saved tutorial progress (as if event restarted)
		 */
		reset: function() {
			us.values(this.steps).forEach(this.resetStep);
		},

		/* constants for step IDs*/
		steps : {
			SELECT_TARGET: 'step1',
			STEP2: 'step2',
			STEP3: 'step3',
			STEP4: 'step4',
			STEP5: 'step5',
			STEP6: 'step6',
			STEP7: 'step7',
			STEP8: 'step8',
			STEP9: 'step9'
		},

		/* what to show when pressing the EventInfo button */
		getTutorialOrder : function() {
			return [
				this.steps.SELECT_TARGET,
				this.steps.STEP2,
				this.steps.STEP3,
				this.steps.STEP4,
				this.steps.STEP5,
				this.steps.STEP6,
				this.steps.STEP7,
				this.steps.STEP8
			];
		}

	};

	return AssassinsTutorial;
});
