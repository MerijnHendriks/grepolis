/*globals GameViews, GameControllers */

(function() {
	'use strict';

	var SubWindowRenameNoteController = GameControllers.BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new GameViews.SubWindowRenameNoteView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getTabTitle : function() {
			return this.window_controller.getTabTitle();
		},

		onBtnRenameClick : function(title) {
			this.window_controller.renameActiveNote(
				title,
				this.window_controller.closeSubWindow.bind(this.window_controller)
			);
		},

		onBtnCancelClick : function() {
			this.window_controller.closeSubWindow();
		},

		destroy : function() {

		}
	});

	window.GameControllers.SubWindowRenameNoteController = SubWindowRenameNoteController;
}());
