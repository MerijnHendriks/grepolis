/*globals GameControllers, GameViews, GameEvents */
(function() {
	'use strict';

	var SubWindowNewNoteController = GameControllers.BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowNewNoteView({
				el : this.$el,
				controller : this
			});

			this.registerEventListeners();

			return this;
		},

		registerEventListeners : function() {
			this.observeEvent(GameEvents.document.key.enter.up, function() {
				this.createNote(this.view.getNoteName());
			}.bind(this));
		},

		onBtnCreateClick : function(title) {
			this.createNote(title);
		},

		onBtnCancelClick : function() {
			this.window_controller.closeSubWindow();
		},

		createNote : function(title) {
			this.window_controller.createNote(title, function() {
				this.window_controller.closeSubWindow();
			}.bind(this));
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowNewNoteController = SubWindowNewNoteController;
}());
