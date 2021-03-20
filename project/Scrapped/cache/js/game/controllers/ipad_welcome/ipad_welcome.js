/*global GameViews, GameControllers, HelperPlayerHints */

(function() {
	'use strict';

	var IpadWelcomeController = GameControllers.TabController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage : function() {
			this.view = new GameViews.IpadWelcomeView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		onBtnDontShowTipClick : function() {
			//Disable hint
			HelperPlayerHints.disable('ipad');
			//Close window
			this.closeWindow();
		},

		destroy : function() {

		}
	});

	window.GameControllers.IpadWelcomeController = IpadWelcomeController;
}());