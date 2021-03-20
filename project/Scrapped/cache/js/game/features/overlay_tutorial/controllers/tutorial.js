define('features/overlay_tutorial/controllers/tutorial', function() {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		SubWindowTutorialView = require('features/overlay_tutorial/views/tutorial'),
		TutorialHelper = require('features/overlay_tutorial/helpers/tutorial');

	return SubWindowController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			SubWindowController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.player_hint_key = options.player_hint_key;
			this.tutorial_step = 1;
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowTutorialView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		/**
		 * @return {string} tutorial step
		 */
		getCurrentTutorialStep : function() {
			return this.tutorial_step;
		},

		setCurrentTutorialStep: function(tutorial_step) {
			this.tutorial_step = tutorial_step;
		},

		getStepCount: function() {
			return this.window_controller.getTutorialOrder().length;
		},

		getTutorialStepString: function() {
			return this.window_controller.getTutorialOrder()[this.getCurrentTutorialStep() - 1];
		},

		isMarkedAsFinished: function() {
			return TutorialHelper.hasBeenCompleted(this.player_hint_key);
		},

		finishTutorial: function() {
			TutorialHelper.markAsFinished(this.player_hint_key);
		},

		/**
		 * @return {string} - the tutorial text translation for this step
		 */
		getText: function() {
			return this.window_controller.getTutorialStepText(this.getTutorialStepString());
		},

		getAdditionalTutorialTexts: function () {
			if (this.window_controller.hasOwnProperty('getAdditionalTutorialTexts')) {
				return this.window_controller.getAdditionalTutorialTexts();
			}

			return {};
		},

		destroy : function() {

		}
	});
});
