/* global LocalStore */
define('events/flipping_images/controllers/main', function(require) {
	'use strict';

	var FlippingImagesController,
		TabController = window.GameControllers.TabController,
		FlippingImagesEventView = require('events/flipping_images/views/main'),
		DialogSteps = require('events/flipping_images/data/dialog_data'),
		active_step = 1;

	FlippingImagesController = TabController.extend({
		view: null,

		initialize: function (options) {
			//Don't remove it, it should call its parent
			TabController.prototype.initialize.apply(this, arguments);
			// get state from local storage if anything was saved
			active_step = this.getSavedCurrentStepPosition() ? this.getSavedCurrentStepPosition() : this.getCurrentStep();
			this.setOnBeforeClose(this.saveCurrentStepPosition.bind(this));
		},

		renderPage: function () {
			this.initializeView();
			return this;
		},

		initializeView: function () {
			this.view = new FlippingImagesEventView({
				controller: this,
				el: this.$el
			});
		},

		/**
		 * Get active step number
		 * @returns {number}
		 */
		getCurrentStep: function() {
			return active_step;
		},

		/**
		 * Set new active step number
		 * @param step will always be 1 or -1
		 */
		setActiveStep: function(step) {
			var new_step = active_step + step;
			if (new_step > 0 && new_step <= this.getStepsLength()) {
				active_step = new_step;
			}
		},

		/**
		 * Gets the length of the step array
		 * @returns {number}
		 */
		getStepsLength: function() {
			return DialogSteps.length;
		},

		/**
		 * Gets active step object
		 * @returns {object}
		 */
		getCurrentStepInfo: function() {
			var current_step = this.getCurrentStep() - 1;
			return DialogSteps[current_step];
		},

		/**
		 * Get next active step object (one step forward or one step back)
		 * @param direction can be -1 or 1
		 * @returns {object}
		 */
		getNextStepInfo: function(direction) {
			var current_step = this.getCurrentStep() - 1;
			if ((direction === 1 && current_step < this.getStepsLength()) ||
				(direction === -1 && current_step > 0)) {
				current_step += direction;
				return DialogSteps[current_step];
			}
		},

		/**
		 * Saves the state to local storage
		 */
		saveCurrentStepPosition: function() {
			LocalStore.set('flippingimages::step', this.getCurrentStep());
		},

		/**
		 * Gets the state from local storage
		 * @returns {number}
		 */
		getSavedCurrentStepPosition: function() {
			return LocalStore.get('flippingimages::step');
		}
	});

	return FlippingImagesController;
});
