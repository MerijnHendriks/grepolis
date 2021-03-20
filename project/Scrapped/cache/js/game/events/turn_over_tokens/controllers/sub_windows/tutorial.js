define('events/turn_over_tokens/controllers/sub_windows/tutorial', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowTutorialView = require('events/turn_over_tokens/views/sub_windows/tutorial');
	var Tutorial = require('events/turn_over_tokens/helper/tutorial');

	var SubWindowTutorialController = GameControllers.BaseController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.tutorial_id = options.tutorial_id;
			this.is_linear_tutorial = options.linear_tutorial;
			this.resolvePromise = options.resolvePromise;
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowTutorialView({
				el : this.$el,
				controller : this
			});
			if(this.getTutorialId() === Tutorial.steps.STEP4) {
				this.$el.find('.assassins_tutorial .content').append($('<div class=\'tutorial_reset_targets\'>'+ this.window_controller.l10n.btn_reset_target.label +'</div>'));
			}
			return this;
		},

		/**
		 * @return {string} unique identifier for this tutorial step
		 */
		getTutorialId : function() {
			return this.tutorial_id;
		},

		/**
		 * @return {string} - the tutorial text translation for this step
		 */
		getText: function() {
			return this.getl10n()[this.getTutorialId()];
		},

		/**
		 * Marks the step as done in the backend via player-hints,
		 * Closes the sub-window and calls a callback (if given)
		 */
		closeTutorialStep: function() {
			if (!this.is_linear_tutorial) {
				Tutorial.saveStepAsSeen(this.getTutorialId());
			}
			this.window_controller.closeSubWindow();
			this.resolvePromise();
		},

		destroy : function() {

		}
	});

	return SubWindowTutorialController;
});
