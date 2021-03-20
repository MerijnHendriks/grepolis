/*globals GameControllers, GameViews, WM, ValentinesDayCollectWindowFactory */
(function() {
	'use strict';

	var BaseController = GameControllers.BaseController;
	var LayoutGameEventsItemsView = GameViews.LayoutGameEventsItemsView;

	var LayoutGameEventsItemsController = BaseController.extend({
		view : null,

		initialize : function(options) {
			//Call method from the parent
			BaseController.prototype.initialize.apply(this, arguments);

			this.view = new LayoutGameEventsItemsView({
				el : this.$el,
				controller : this
			});

			this.registerEventListeners();
		},

		registerEventListeners : function() {
			this.getModel('mermaid').onVisibilityChange(this, this.onVisiblityChange.bind(this));

			//This event is only for one day, so we don't have to care about too long intervals
			this.registerTimerOnce('mermaid_gone_away', this.getTimeLeft() * 1000, function() {
				this.view.changeMermaidVisibility(false);

				WM.closeWindowsByType('valentinesday_collect');
			}.bind(this));
		},

		isMermaidVisible : function() {
			return this.getModel('mermaid').isVisible();
		},

		getTimeLeft : function() {
			return this.getModel('mermaid').getTimeLeft();
		},

		renderPage : function() {
			this.view.render();

			this.view.changeMermaidVisibility(this.isMermaidVisible());

			return this;
		},

		onVisiblityChange : function() {
			this.view.changeMermaidVisibility(this.isMermaidVisible());

			WM.closeWindowsByType('valentinesday_collect');
		},

		onMermaidClick : function() {
			ValentinesDayCollectWindowFactory.openWindow(this.getModel('mermaid'));
		},

		destroy : function() {

		}
	});

	window.GameControllers.LayoutGameEventsItemsController = LayoutGameEventsItemsController;
}());
