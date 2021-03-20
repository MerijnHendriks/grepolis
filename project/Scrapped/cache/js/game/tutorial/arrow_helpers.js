/* global MM */
/**
 * The Tutorial arrows are called GameHelpers.
 * This is the public API to manage them
 */

define('tutorial/arrow_helpers', function() {
	'use strict';

	var controller = require('tutorial/arrow_controller');

	/**
	 * @constructor
	 */
	var GameHelpers = function (o) {
		this.initialize(o);
	};

	/**
	 * Initializes helpers
	 */
	GameHelpers.prototype.initialize = function (o) {
		controller.initialize({
			templates: {
				arrow: '#tpl_helper_arrow',
				highlight: '#tpl_helper_highlight'
			}
		});
	};

	/*
	 * Create new helpers set
	 * o.setId: local context
	 * o.steps: steps to display
	 */
	GameHelpers.prototype.add = function (o, force) {
		var player_settings_model = MM.getModelByNameAndPlayerId('PlayerSettings');

		if (force || (player_settings_model && player_settings_model.tutorialArrowActivatedByDefault())) {
			controller.addSet(o);
		}
	};

	GameHelpers.prototype.extend = function (o) {
		var player_settings_model = MM.getModelByNameAndPlayerId('PlayerSettings');

		if (player_settings_model && player_settings_model.tutorialArrowActivatedByDefault()) {
			controller.extendSet(o);
		}
	};

	GameHelpers.prototype.remove = function (o) {
		//console.log('remove', o);
		controller.removeSet(o);
	};

	GameHelpers.prototype.removeAll = function (o) {
		//console.log('removeAll', o);
		controller.removeAllSets();
	};

	GameHelpers.prototype.status = function (o) {
		controller.showStatus(o);
	};

	GameHelpers.prototype.animation = function (o) {
		controller.changeAnimationStatus(o);
	};

	GameHelpers.prototype.hasSet = function (set_id) {
		return controller.hasSet(set_id);
	};

	GameHelpers.prototype.isSetShown = function (set_id) {
		return controller.isSetShown(set_id);
	};

	GameHelpers.prototype.getActiveInGroup = function (group_id) {
		return controller.getActiveInGroup(group_id);
	};

	GameHelpers.prototype.prioritizeInGroup = function (set_id) {
		return controller.prioritizeInGroup(set_id);
	};

	GameHelpers.prototype.resetStepsDisplayed = function(set_id, group_id) {
		controller.resetStepsDisplayed(set_id, group_id);
	};

	/*
	 * Cleans up code
	 */
	GameHelpers.prototype.destroy = function () {
	};

	//Make this class visible globally - Singleton
	window.GameHelpers = new GameHelpers();

	// require returns the singleton instance
	return window.GameHelpers;
});
