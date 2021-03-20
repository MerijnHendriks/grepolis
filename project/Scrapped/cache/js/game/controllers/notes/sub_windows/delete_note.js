/*globals GameControllers, GameViews */
(function() {
	'use strict';

	var SubWindowDeleteNoteController = GameControllers.BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowDeleteNoteView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		onBtnYesClick : function() {
			this.window_controller.deleteNote();
			this.window_controller.closeSubWindow();
		},

		onBtnNoClick : function() {
			this.window_controller.closeSubWindow();
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowDeleteNoteController = SubWindowDeleteNoteController;
}());
