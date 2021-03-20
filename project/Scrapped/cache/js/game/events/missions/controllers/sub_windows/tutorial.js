define('events/missions/controllers/sub_windows/tutorial', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowTutorialView = require('events/missions/views/sub_windows/tutorial');
	var Tutorial = require('events/missions/helpers/tutorial');

	return GameControllers.SubWindowController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
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
			return Tutorial.getTutorialOrder().length;
		},

		getTutorialStepString: function() {
			return Tutorial.getTutorialOrder()[this.getCurrentTutorialStep() - 1];
		},

		isTutorialMarkedAsFinished: function() {
			return Tutorial.hasBeenCompleted();
		},

		finishTutorial: function() {
			Tutorial.markAsFinished();
		},

		/**
		 * @return {string} - the tutorial text translation for this step
		 */
		getText: function() {
			return this.getl10n().tutorial[this.getTutorialStepString()];
		},

		destroy : function() {

		}
	});
});
