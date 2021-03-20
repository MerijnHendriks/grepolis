define('events/campaign/controllers/sub_windows/tutorial', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowTutorialView = require('events/campaign/views/sub_windows/tutorial');

	var SubWindowTutorial = GameControllers.BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.show_full_tutorial = options.show_full_tutorial || false;

			this.on_close = options.on_close;

			this.stage_id = options.stage_id;
			this.tutorial_ids = options.tutorial_ids;
			this.current_step = 0;
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowTutorialView({
				el : this.$el,
				controller : this,
				show_fight_image : false // (this.stage_id === 1)
			});

			return this;
		},

		getTutorialText : function() {
			var stories = this.getl10n();
			return stories[this.getCurrentTutorialId()];
		},

		closeTutorial : function() {
			this.window_controller.hideTutorial();

			if (this.on_close) {
                this.on_close.call(this);
			}
		},

		showTutorial : function (step) {
			this.setCurrentStep(step);
			this.view.reRender();
		},

		getCurrentTutorialId: function () {
			return this.tutorial_ids[this.current_step];
		},

		getCurrentStep : function () {
			return this.current_step;
		},

		setCurrentStep : function (step) {
			this.current_step = step;
		},

		isLastStep : function () {
			return (this.current_step + 1) === this.tutorial_ids.length;
		},

		isFirstStep : function () {
			return this.current_step === 0;
		},

		showFullTutorial : function () {
		 	return this.show_full_tutorial;
		},

		destroy : function() {

		}
	});

	return SubWindowTutorial;
});
